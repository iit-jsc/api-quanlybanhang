import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination'
import { AnyObject, TokenPayload } from './../interfaces/common.interface'
import { generate as generateIdentifier } from 'short-uuid'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { PER_PAGE } from 'enums/common.enum'
import { productSelect } from 'responses/product.response'
import { productOptionSelect } from 'responses/product-option-group.response'
import { OrderDetailStatus, PrismaClient } from '@prisma/client'
import { CreateOrderProductsDto } from 'src/order/dto/order.dto'
import { IOrderDetail } from 'interfaces/orderDetail.interface'

const prisma = new PrismaClient()

const paginate: PaginatorTypes.PaginateFunction = paginator({
  perPage: PER_PAGE
})

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

export async function customPaginate(prismaModel: any, queryArgs: any, paginationArgs: any) {
  const result = await paginate(prismaModel, queryArgs, paginationArgs)

  return {
    list: result.data,
    meta: result.meta
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

export function generateCode(wordStart: string) {
  const uuid = crypto.randomUUID()
  return (
    wordStart +
    uuid
      .replace(/-/g, '')
      .split('')
      .map(char => char.charCodeAt(0).toString())
      .join('')
      .slice(0, 10)
  )
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

export async function getTotalInOrder(orderDetails: IOrderDetail[]) {
  return orderDetails.reduce((total, order) => {
    const productPrice = order.product.price || 0

    const optionsTotal = (order.productOptions || []).reduce(
      (sum, option) => sum + (option.price || 0),
      0
    )

    return total + order.amount * (productPrice + optionsTotal)
  }, 0)
}
