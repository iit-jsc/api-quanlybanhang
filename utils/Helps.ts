import slugify from 'slugify'
import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination'
import { AnyObject, PaginationArgs, TokenPayload } from './../interfaces/common.interface'
import { generate as generateIdentifier } from 'short-uuid'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { PER_PAGE } from 'enums/common.enum'
import { productSortSelect } from 'responses/product.response'
import { productOptionSelect } from 'responses/product-option-group.response'
import {
  ConditionOperator,
  DiscountFor,
  DiscountType,
  OrderDetailStatus,
  PrismaClient,
  VoucherConditionType,
  VoucherProductType,
  VoucherType
} from '@prisma/client'
import { CreateOrderProductsDto } from 'src/order/dto/order.dto'
import { IOrderDetail } from 'interfaces/orderDetail.interface'
import { HttpException, HttpStatus } from '@nestjs/common'
import { IVoucherCheckRequest, IVoucher, IVoucherCondition } from 'interfaces/voucher.interface'
import { voucherDetailSelect } from 'responses/voucher.response'
import { discountCodeSelect } from 'responses/discountCode.response'
import { customerSelect } from 'responses/customer.response'

const prisma = new PrismaClient()

export function generateUniqueId(): string {
  return generateIdentifier()
}

export function onlyBranchFilter(tokenPayload: TokenPayload) {
  return {
    id: tokenPayload.branchId,
    isPublic: true
  }
}

export function detailPermissionFilter(tokenPayload: TokenPayload) {
  return {
    some: {
      isPublic: true,
      branchId: tokenPayload.branchId
    }
  }
}

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false)
  }
  callback(null, true)
}

const maxSize = 2 * 1024 * 1024

export const CustomFileInterceptor = (
  fieldName: string,
  destinationPath: string = './uploads',
  fileSize: number = maxSize
) =>
  FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: destinationPath,
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('')
        cb(null, `${randomName}${extname(file.originalname)}`)
      }
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize }
  })

export function CustomFilesInterceptor(
  fieldName: string,
  maxFiles: number,
  destinationPath: string = './uploads',
  fileSize: number = maxSize
) {
  return FilesInterceptor(fieldName, maxFiles, {
    storage: diskStorage({
      destination: destinationPath,
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('')
        cb(null, `${randomName}${extname(file.originalname)}`)
      }
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize }
  })
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString) // Chuyển chuỗi thành đối tượng Date
  const day = date.getDate().toString().padStart(2, '0') // Lấy ngày (dd)
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Lấy tháng (mm) (0-indexed)
  const year = date.getFullYear() // Lấy năm (yyyy)
  return `${day}/${month}/${year}`
}

export async function customPaginate<T extends keyof PrismaClient, M extends PrismaClient[T]>(
  prismaModel: M,
  queryArgs: AnyObject,
  paginationArgs: PaginationArgs
) {
  const paginateFn: PaginatorTypes.PaginateFunction = paginator({
    perPage: paginationArgs.perPage || PER_PAGE
  })

  const result = await paginateFn(prismaModel, queryArgs, paginationArgs)

  const totalPages = Math.ceil(result.meta.total / result.meta.perPage)

  return {
    list: result.data,
    meta: {
      ...result.meta,
      totalPages
    }
  }
}

export const removeDiacritics = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/d/g, 'đ')
    .replace(/D/g, 'Đ')
}

export function extractPermissions(data: AnyObject) {
  return Object.values(data)
}

export function generateCode(wordStart: string, length?: number) {
  const uuid = crypto.randomUUID()
  return (
    wordStart +
    uuid
      .replace(/-/g, '')
      .split('')
      .map(char => char.charCodeAt(0).toString())
      .join('')
      .slice(0, length || 8)
  )
}

export function generateSlug(text) {
  const slug = slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi'
  })

  const uuid = generateCode('')

  return `${slug}-${uuid}`
}

export async function getOrderDetails(
  data: CreateOrderProductsDto[],
  status: OrderDetailStatus,
  accountId: string,
  branchId: string
) {
  return await Promise.all(
    data.map(async item => {
      let productOptions = []

      const product = await prisma.product.findUniqueOrThrow({
        where: { id: item.productId },
        select: productSortSelect
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
        status,
        product: product,
        note: item.note,
        productOptions: productOptions,
        branchId,
        createdBy: accountId,
        updatedBy: accountId
      }
    })
  )
}

export function getOrderTotal(orderDetails: IOrderDetail[]) {
  return orderDetails.reduce((total, order) => {
    const optionsTotal = (order.productOptions || []).reduce((sum, option) => sum + option.price, 0)

    return total + order.amount * (order.product.price + optionsTotal)
  }, 0)
}

export async function getVoucher(
  params: {
    voucherId: string
    branchId: string
    orderDetails: IOrderDetail[]
    voucherCheckRequest: IVoucherCheckRequest
  },
  prisma?: PrismaClient
): Promise<{ voucherValue: number; voucherProducts?: AnyObject }> {
  let voucherValue = 0
  const { voucherId, branchId, orderDetails, voucherCheckRequest } = params
  const { orderTotal } = params.voucherCheckRequest
  if (!voucherId) return { voucherValue }

  const matchVoucher: IVoucher = await prisma.voucher.findUnique({
    where: {
      id: voucherId,
      branchId,
      isActive: true,
      startDate: {
        lte: new Date(new Date().setHours(23, 59, 59, 999))
      },
      OR: [
        {
          endDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        {
          endDate: null
        }
      ]
    },
    select: voucherDetailSelect
  })

  // Kiểm tra voucher có hợp lệ không
  checkValidVoucher(matchVoucher, voucherCheckRequest, orderDetails)

  // Tính số tiền giảm giá theo voucher
  if (matchVoucher.type === VoucherType.VALUE) {
    if (matchVoucher.discountType === DiscountType.PERCENT) {
      voucherValue = (orderTotal * matchVoucher.discount) / 100
    }

    if (matchVoucher.discountType === DiscountType.VALUE) {
      voucherValue = matchVoucher.discount
    }
  }

  // Xử lý voucher dạng sản phẩm (tặng sản phẩm hoặc giảm giá sản phẩm khi mua số lượng nhất định)
  if (matchVoucher.type === VoucherType.PRODUCT) {
    matchVoucher.voucherProducts.forEach(vp => {
      if (vp.type !== VoucherProductType.DISCOUNT_PRODUCT) return

      // Lọc tất cả orderDetails có cùng productId và tính tổng số lượng
      const orderProductList = orderDetails.filter(od => od.product.id === vp.product.id)
      const totalOrderQuantity = orderProductList.reduce((sum, od) => sum + od.amount, 0)

      if (totalOrderQuantity === 0) return // Không có sản phẩm nào phù hợp

      // Tìm điều kiện `minQuantity`

      const voucherCondition = matchVoucher.conditionGroups
        .flatMap(group => group.conditions)
        .find(vc => vc.product?.id === vp.product?.id)

      const minQuantity = voucherCondition?.minQuantity ?? 0

      // Kiểm tra số lượng được giảm giá
      const eligibleQuantity = Math.max(0, totalOrderQuantity - minQuantity)

      if (eligibleQuantity > 0 && vp.promotionalPrice) {
        // Lấy giá sản phẩm từ orderDetails
        const productPrice = orderProductList[0]?.product?.price ?? 0

        // Tính mức giảm giá dựa trên giá sản phẩm thực tế trừ đi `promotionalPrice`
        const discountPerItem = productPrice - vp.promotionalPrice

        // Nếu mức giảm giá hợp lệ, cộng vào tổng giảm giá
        if (discountPerItem > 0) {
          voucherValue += discountPerItem * eligibleQuantity
        }
      }
    })
  }

  if (matchVoucher.maxValue !== null && matchVoucher.maxValue < voucherValue)
    voucherValue = matchVoucher.maxValue

  // Tất cả hợp lệ tăng số lương sử dụng voucher lên 1
  await prisma.voucher.update({
    where: { id: voucherId },
    data: {
      amountApplied: {
        increment: 1
      }
    }
  })

  return { voucherValue, voucherProducts: matchVoucher.voucherProducts }
}

export function checkValidVoucher(
  voucher: IVoucher,
  voucherCheckRequest: IVoucherCheckRequest,
  orderDetails: IOrderDetail[]
) {
  if (!voucher) throw new HttpException('Không tìm thấy khuyến mãi!', HttpStatus.NOT_FOUND)

  if (voucher.amountApplied >= voucher.amount)
    throw new HttpException('Đã quá số lượng áp dụng!', HttpStatus.CONFLICT)

  let isValid = voucher.operator === ConditionOperator.AND

  // Nếu không có điều kiện thì không cần xét
  if (!voucher.conditionGroups || !voucher.conditionGroups.length) isValid = true
  else {
    for (const group of voucher.conditionGroups) {
      const { operator, conditions } = group
      let groupValid = operator === ConditionOperator.AND

      for (const condition of conditions) {
        const conditionValid = checkCondition(condition, voucherCheckRequest, orderDetails)

        if (operator === ConditionOperator.AND && !conditionValid) {
          groupValid = false
          break
        }

        if (operator === ConditionOperator.OR && conditionValid) {
          groupValid = true
          break
        }
      }

      if (voucher.operator === ConditionOperator.AND && !groupValid) {
        isValid = false
        break
      }

      if (voucher.operator === ConditionOperator.OR && groupValid) {
        isValid = true
        break
      }
    }
  }

  if (!isValid)
    throw new HttpException(
      'Không đủ điều kiện áp dụng khuyến mãi!',
      HttpStatus.UNPROCESSABLE_ENTITY
    )
}

export function checkCondition(
  condition: IVoucherCondition,
  voucherCheckRequest: IVoucherCheckRequest,
  orderDetails: IOrderDetail[]
) {
  const { type, minQuantity, minCustomer, minOrderTotal, product } = condition

  // Kiểm tra giảm giá theo số lượng sản phẩm
  if (type === VoucherConditionType.MIN_PRODUCT_QUANTITY) {
    const totalQuantity = orderDetails
      .filter(item => item.product.id === product.id)
      .reduce((sum, item) => sum + item.amount, 0)

    if (minQuantity && totalQuantity < minQuantity) return false
  }

  // Kiểm tra giảm giá theo tổng tiền đơn hàng
  if (type === VoucherConditionType.MIN_ORDER_TOTAL) {
    if (voucherCheckRequest.orderTotal < minOrderTotal) return false
  }

  // Kiểm tra giảm giá theo tổng số lượng khách
  if (type === VoucherConditionType.MIN_CUSTOMER) {
    if (voucherCheckRequest.totalPeople < minCustomer) return false
  }

  return true
}

export async function getDiscountCode(
  code: string,
  orderTotal: number,
  branchId: string,
  prisma: PrismaClient
) {
  let discountCodeValue = 0

  if (!code) return discountCodeValue

  const discountCode = await prisma.discountCode.findUnique({
    where: {
      branchId_code: {
        branchId: branchId,
        code: code
      },
      isUsed: false,
      discountIssue: {
        startDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        },
        AND: [
          {
            OR: [
              {
                endDate: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              },
              {
                endDate: null
              }
            ]
          }
        ]
      }
    },
    select: discountCodeSelect
  })

  // Kiểm tra điều kiện
  if (!discountCode)
    throw new HttpException('Mã giảm giá không tồn tại hoặc đã sử dụng!', HttpStatus.NOT_FOUND)

  if (discountCode.discountIssue.minOrderTotal > orderTotal)
    throw new HttpException('Tổng số tiền đơn hàng chưa đủ để áp dụng!', HttpStatus.CONFLICT)

  // Tính toán giảm giá
  if (discountCode.discountIssue.discountType === DiscountType.PERCENT)
    discountCodeValue = (orderTotal * discountCode.discountIssue.discount) / 100

  if (discountCode.discountIssue.discountType === DiscountType.VALUE)
    discountCodeValue = discountCode.discountIssue.discount

  if (
    discountCode.discountIssue.maxValue !== null &&
    discountCode.discountIssue.maxValue < discountCodeValue
  )
    discountCodeValue = discountCode.discountIssue.maxValue

  // Cập nhật mã giảm giá đã sử dụng
  await prisma.discountCode.update({
    where: {
      branchId_code: {
        branchId: branchId,
        code: code
      }
    },
    data: { isUsed: true }
  })

  return discountCodeValue
}

export async function getCustomerDiscount(
  customerId: string,
  orderTotal: number,
  prisma?: PrismaClient
) {
  prisma = prisma || this.prisma

  const customerValue = 0

  const customer = await prisma.customer.findFirstOrThrow({
    where: { id: customerId },
    select: customerSelect
  })

  if (customer.discountFor === DiscountFor.CUSTOMER) {
    if (customer.discountType === DiscountType.PERCENT)
      return (orderTotal * customer.discount) / 100

    if (customer.discountType === DiscountType.VALUE) return customer.discount
  } else {
    if (!customer.customerType) return 0

    if (customer.customerType?.discountType === DiscountType.PERCENT)
      return (orderTotal * customer.customerType?.discount) / 100

    if (customer.customerType?.discountType === DiscountType.VALUE)
      return customer.customerType?.discount
  }

  return customerValue
}

export async function handleOrderDetailsBeforePayment(
  prisma: PrismaClient,
  conditions: { tableId?: string; orderId?: string }
) {
  await prisma.orderDetail.deleteMany({
    where: {
      ...conditions,
      status: OrderDetailStatus.CANCELLED
    }
  })

  await prisma.orderDetail.updateMany({
    where: {
      ...conditions,
      status: {
        not: OrderDetailStatus.SUCCESS
      }
    },
    data: {
      status: OrderDetailStatus.SUCCESS
    }
  })
}
