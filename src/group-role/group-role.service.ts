import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class GroupRoleService {
  constructor(private readonly prisma: PrismaService) {}
  // async findAll(params: FindManyGroupRoleDto) {
  //   const { page, perPage, types, orderBy } = params
  //   const where: Prisma.GroupRoleWhereInput = {
  //     type: {
  //       in: types
  //     }
  //   }

  //   return await customPaginate(
  //     this.prisma.groupRole,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where,
  //       include: {
  //         roles: true
  //       }
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }
}
