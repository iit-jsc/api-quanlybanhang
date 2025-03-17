import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { customPaginate } from 'utils/Helps'
import { FindManyGroupRoleDto } from './dto/group-role.dto'

@Injectable()
export class GroupRoleService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(params: FindManyGroupRoleDto) {
    let { page, perPage, types, orderBy } = params
    let where: Prisma.GroupRoleWhereInput = {
      type: {
        in: types
      }
    }

    return await customPaginate(
      this.prisma.groupRole,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        include: {
          roles: true
        }
      },
      {
        page,
        perPage
      }
    )
  }
}
