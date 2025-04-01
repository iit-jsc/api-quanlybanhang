import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateRoleDto, FindManyRoleDto, UpdateRoleDto } from './dto/role.dto'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { Prisma, PrismaClient } from '@prisma/client'
import { roleSelect } from 'responses/role.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService
  ) {}

  async create(data: CreateRoleDto, accountId: string, shopId: string) {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: accountId,
        shopId,
        ...(data.permissionCodes && {
          permissions: {
            connect: data.permissionCodes.map(code => ({
              code
            }))
          }
        })
      },
      select: roleSelect
    })
  }

  async findAll(params: FindManyRoleDto, shopId: string) {
    const { page, perPage, keyword, orderBy } = params

    const where: Prisma.RoleWhereInput = {
      shopId,
      ...(keyword && { name: { contains: removeDiacritics(keyword) } })
    }

    return await customPaginate(
      this.prisma.role,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: roleSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async update(id: string, data: UpdateRoleDto, accountId: string, shopId: string) {
    return await this.prisma.role.update({
      data: {
        name: data.name,
        description: data.description,
        updatedBy: accountId,
        ...(data.permissionCodes && {
          permissions: {
            set: data.permissionCodes.map(code => ({
              code
            }))
          }
        })
      },
      where: {
        id,
        shopId
      }
    })
  }

  async findUniq(id: string, shopId: string) {
    return this.prisma.role.findUniqueOrThrow({
      where: {
        id,
        shopId
      },
      select: roleSelect
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'Role',
        include: {
          permissions: true
        }
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.role.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          shopId
        }
      })
    })
  }
}
