import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // async findAll(params: FindManyStockDto, tokenPayload: TokenPayload) {
  //   let { page, perPage, productId, orderBy } = params

  //   let where: Prisma.StockWhereInput = {
  //     branchId: tokenPayload.branchId,
  //     ...(productId && {
  //       productId
  //     })
  //   }

  //   return await customPaginate(
  //     this.prisma.stock,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       include: {
  //         warehouse: true
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }
}
