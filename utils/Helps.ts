import slugify from 'slugify'
import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination'
import { AnyObject, PaginationArgs, TokenPayload } from './../interfaces/common.interface'
import { generate as generateIdentifier } from 'short-uuid'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { PER_PAGE } from 'enums/common.enum'
import { productShortSelect } from 'responses/product.response'
import { productOptionSelect } from 'responses/product-option-group.response'
import { DiscountType, NotifyType, OrderDetailStatus, PrismaClient } from '@prisma/client'
import { CreateOrderProductsDto } from 'src/order/dto/order.dto'
import { HttpException, HttpStatus } from '@nestjs/common'
import { customerSelect } from 'responses/customer.response'
import { IProduct } from 'interfaces/product.interface'
import { IProductOption } from 'interfaces/productOption.interface'
import { orderDetailShortSelect } from 'responses/order-detail.response'

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

const maxSize = 10 * 1024 * 1024

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
  defaultStatus: OrderDetailStatus,
  accountId: string,
  branchId: string
) {
  return await Promise.all(
    data.map(async item => {
      let productOptions = []

      const product = await prisma.product.findUniqueOrThrow({
        where: { id: item.productId },
        select: productShortSelect
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

export function generateCompositeKey(
  tableId: string,
  productId: string,
  note?: string,
  productOptionIds?: string[]
): string {
  const sortedOptions =
    productOptionIds && productOptionIds.length > 0 ? productOptionIds.sort().join('_') : 'empty'

  const notePart = note ? note.trim() : 'empty'

  return `${tableId || 'empty'}_${productId || 'empty'}_${sortedOptions}_${notePart}`
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}
