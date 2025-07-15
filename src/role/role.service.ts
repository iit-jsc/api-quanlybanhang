import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateRoleDto, FindManyRoleDto, UpdateRoleDto } from './dto/role.dto'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { roleSelect } from 'responses/role.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateRoleDto, accountId: string, shopId: string) {
    return this.prisma.$transaction(async prisma => {
      const role = await prisma.role.create({
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

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'Role',
          targetName: role.name,
          targetId: role.id
        },
        { shopId },
        accountId
      )

      return role
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
    return this.prisma.$transaction(async prisma => {
      // Kiểm tra xem role có isRoot = true không
      const existingRole = await prisma.role.findFirstOrThrow({
        where: { id, shopId },
        select: { id: true, name: true, isRoot: true }
      })

      if (existingRole.isRoot) {
        throw new HttpException(
          `Không thể cập nhật vai trò ${existingRole.name} vì đây là vai trò quản trị!`,
          HttpStatus.BAD_REQUEST
        )
      }

      const role = await prisma.role.update({
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
        select: roleSelect,
        where: {
          id,
          shopId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'Role',
          targetId: role.id,
          targetName: role.name
        },
        { shopId },
        accountId
      )

      return role
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
      // Kiểm tra xem có role nào đang được sử dụng bởi account không
      const rolesWithAccounts = await prisma.role.findMany({
        where: {
          id: { in: data.ids },
          shopId
        },
        select: {
          id: true,
          name: true,
          isRoot: true,
          accounts: {
            select: {
              id: true,
              user: {
                select: { name: true }
              }
            }
          }
        }
      })

      // Kiểm tra role có isRoot = true
      const rootRoles = rolesWithAccounts.filter(role => role.isRoot)
      if (rootRoles.length > 0) {
        const rootRoleNames = rootRoles.map(role => role.name)
        throw new HttpException(
          `Không thể xóa vai trò ${rootRoleNames.join(', ')} vì đây là vai trò quản trị!`,
          HttpStatus.BAD_REQUEST
        )
      }

      const rolesInUse = rolesWithAccounts.filter(role => role.accounts.length > 0)

      if (rolesInUse.length > 0) {
        const roleNames = rolesInUse.map(role => role.name)

        throw new HttpException(
          `Không thể xóa vai trò ${roleNames.join(', ')} vì đang đươc sử dụng!`,
          HttpStatus.BAD_REQUEST
        )
      }

      const entities = await prisma.role.findMany({
        where: { id: { in: data.ids } },
        include: {
          permissions: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'Role'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'Role',
            targetName: entities.map(item => item.name).join(', ')
          },
          { shopId },
          accountId
        )
      ])

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
