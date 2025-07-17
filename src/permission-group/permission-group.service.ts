import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreatePermissionGroupDto, FindManyPermissionGroupDto } from './dto/permission-group.dto'
import { Prisma } from '@prisma/client'
import { customPaginate } from 'helpers'

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

  async create(data: CreatePermissionGroupDto) {
    return await this.prisma.permissionGroup.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type
      }
    })
  }
}
