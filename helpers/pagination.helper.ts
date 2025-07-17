import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination'
import { AnyObject, PaginationArgs } from '../interfaces/common.interface'
import { PER_PAGE } from 'enums/common.enum'
import { PrismaClient } from '@prisma/client'

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
