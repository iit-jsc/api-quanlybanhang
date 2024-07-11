import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { TokenPayload } from 'interfaces/common.interface';
import { FindManyDto } from 'utils/Common.dto';
import { Prisma } from '@prisma/client';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, productId } = params;

    let where: Prisma.StockWhereInput = {
      branchId: tokenPayload.branchId,
      ...(productId && {
        productId,
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.stock.findMany({
        skip,
        take,
        where,
      }),
      this.prisma.stock.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }
}
