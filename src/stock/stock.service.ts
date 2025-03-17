import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { TokenPayload } from 'interfaces/common.interface'
import { Prisma } from '@prisma/client'
import { customPaginate } from 'utils/Helps'
import { FindManyStockDto } from './dto/stock.dto'

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindManyStockDto, tokenPayload: TokenPayload) {
    let { page, perPage, productId, orderBy } = params

    let where: Prisma.StockWhereInput = {
      branchId: tokenPayload.branchId,
      ...(productId && {
        productId
      })
    }

    return await customPaginate(
      this.prisma.stock,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        include: {
          warehouse: true
        }
      },
      {
        page,
        perPage
      }
    )
  }
}
