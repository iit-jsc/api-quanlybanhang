import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class GroupRoleService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(params: FindManyDto) {
    let { skip, take, types } = params;
    let where: Prisma.GroupRoleWhereInput = {
      type: {
        in: types,
      },
    };
    const [data, totalRecords] = await Promise.all([
      this.prisma.groupRole.findMany({
        skip,
        take,
        where,
        include: {
          roles: true,
        },
      }),
      this.prisma.groupRole.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }
}
