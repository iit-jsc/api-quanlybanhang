import { Injectable } from '@nestjs/common'

import { PrismaService } from 'nestjs-prisma'
import { FindManyDto } from 'utils/Common.dto'
import { customPaginate } from 'utils/Helps'

@Injectable()
export class BusinessTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindManyDto) {
    let { page, perPage } = params

    return await customPaginate(
      this.prisma.businessType,
      {},
      {
        page,
        perPage
      }
    )
  }
}
