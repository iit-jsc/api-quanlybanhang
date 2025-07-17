import { OrderDetailStatus, PrismaClient, DiscountType, NotifyType } from '@prisma/client'
import { CreateOrderProductsDto } from 'src/order/dto/order.dto'
import { HttpException, HttpStatus } from '@nestjs/common'
import { productOptionSelect } from 'responses/product-option-group.response'
import { customerSelect } from 'responses/customer.response'
import { IProduct } from 'interfaces/product.interface'
import { IProductOption } from 'interfaces/productOption.interface'
import { orderDetailShortSelect } from 'responses/order-detail.response'
import { productSelect } from 'responses/product.response'

const prisma = new PrismaClient()

export async function getOrderDetails(
  data: CreateOrderProductsDto[],
  defaultStatus: OrderDetailStatus,
  accountId: string,
  branchId: string
) {
  return await Promise.all(
    data.map(async item => {
      let productOptions = []

      const product = await prisma.product.findUniqueOrThrow({
        where: { id: item.productId },
        select: productSelect
      })

      if (item.productOptionIds)
        productOptions = await prisma.productOption.findMany({
          where: {
            id: {
              in: item.productOptionIds
            }
          },
          select: productOptionSelect
        })

      return {
        amount: item.amount,
        status: item.status || defaultStatus,
        product: product,
        productOriginId: product.id,
        note: item.note,
        productOptions: productOptions,
        branchId,
        createdBy: accountId,
        updatedBy: accountId
      }
    })
  )
}

export interface OrderDetailInput {
  amount: number
  product: IProduct | any
  productOptions?: IProductOption[] | any
}

export function getOrderTotal(orderDetails: OrderDetailInput[]) {
  return Math.floor(
    orderDetails.reduce((total, order) => {
      const optionsTotal = (order.productOptions || []).reduce(
        (sum, option) => sum + option.price,
        0
      )
      return total + order.amount * (order.product.price + optionsTotal)
    }, 0)
  )
}

export async function getOrderDetailsInTable(
  tableId: string,
  prisma: PrismaClient
): Promise<any[]> {
  const orderDetails = await prisma.orderDetail.findMany({
    where: { tableId },
    select: orderDetailShortSelect
  })

  if (!orderDetails.length) throw new HttpException('Không tìm thấy món!', HttpStatus.NOT_FOUND)

  return orderDetails
}

export async function getCustomerDiscount(
  customerId: string,
  orderTotal: number,
  prisma?: PrismaClient
) {
  prisma = prisma || this.prisma

  const customerValue = 0

  if (!customerId) return customerValue

  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
    select: customerSelect
  })

  if (!customer.customerType) return 0

  if (customer.customerType?.discountType === DiscountType.PERCENT)
    return (orderTotal * customer.customerType?.discount) / 100

  if (customer.customerType?.discountType === DiscountType.VALUE)
    return customer.customerType?.discount
}

export async function handleOrderDetailsBeforePayment(
  prisma: PrismaClient,
  conditions: { tableId?: string; orderId?: string; branchId: string }
) {
  await prisma.orderDetail.updateMany({
    where: { ...conditions, amount: 0 },
    data: {
      status: OrderDetailStatus.SUCCESS,
      successAt: new Date()
    }
  })
}

export function getNotifyInfo(status: OrderDetailStatus): { type: NotifyType; content: string } {
  switch (status) {
    case OrderDetailStatus.APPROVED:
      return { type: NotifyType.APPROVED_DISH, content: 'chờ chuyển xuống bếp' }
    case OrderDetailStatus.INFORMED:
      return { type: NotifyType.INFORMED_DISH, content: 'yêu cầu chế biến' }
    case OrderDetailStatus.PROCESSING:
      return { type: NotifyType.PROCESSING_DISH, content: 'đang chế biến' }
    case OrderDetailStatus.SUCCESS:
      return { type: NotifyType.SUCCESS_DISH, content: 'đã cung ứng' }
    default:
      return { type: NotifyType.INFORMED_DISH, content: 'yêu cầu chế biến' }
  }
}
