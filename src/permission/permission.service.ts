import { Injectable } from '@nestjs/common'
import { AddPermissionToAllRolesDto, CreatePermissionDto } from './dto/permission.dto'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionDto) {
    return await this.prisma.permission.create({
      data: {
        name: data.name,
        code: data.code,
        permissionGroup: {
          connect: {
            code: data.permissionGroupCode
          }
        }
      }
    })
  }

  async addPermissionToAllRoles(data: AddPermissionToAllRolesDto) {
    const roles = await this.prisma.role.findMany()

    return await Promise.all(
      roles.map(role =>
        this.prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: {
              connect: { code: data.permissionCode }
            }
          },
          include: {
            permissions: {
              where: {
                code: data.permissionCode
              }
            }
          }
        })
      )
    )
  }
}
