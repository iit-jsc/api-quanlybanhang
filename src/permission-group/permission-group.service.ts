import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { FindManyPermissionGroupDto } from './dto/permission-group.dto'
import { Prisma } from '@prisma/client'
import { customPaginate } from 'utils/Helps'

@Injectable()
export class PermissionGroupService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(params: FindManyPermissionGroupDto) {
    const { page, perPage } = params
    const where: Prisma.PermissionGroupWhereInput = {}

    return await customPaginate(
      this.prisma.permissionGroup,
      {
        where,
        include: {
          permissions: true
        }
      },
      {
        page,
        perPage
      }
    )
  }
}
