import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination'
import { AnyObject, TokenPayload } from './../interfaces/common.interface'
import { generate as generateIdentifier } from 'short-uuid'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import ShortUniqueId from 'short-unique-id'
import { PER_PAGE } from 'enums/common.enum'

const paginate: PaginatorTypes.PaginateFunction = paginator({
  perPage: PER_PAGE
})

export function generateUniqueId(): string {
  return generateIdentifier()
}

export function generateSortCode(): string {
  // eslint-disable-next-line no-var
  var uid = new ShortUniqueId({
    dictionary: [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]
  })

  // var uid = new ShortUniqueId({ dictionary: 'hex' })

  // return uid.randomUUID(10).toUpperCase()
  return ''
}

export function roleBasedBranchFilter(tokenPayload: TokenPayload) {
  const baseConditions = {
    isPublic: true,
    shop: {
      id: tokenPayload.shopId,
      isPublic: true
    }
  }

  // return tokenPayload.type !== ACCOUNT_TYPE.STORE_OWNER
  //   ? {
  //       ...baseConditions,
  //       id: tokenPayload.branchId
  //     }
  //   : baseConditions
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
