import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CheckUniqDto, CreateUserDto, FindManyUserDto, UpdateUserDto } from './dto/user.dto'
import { ActivityAction, Prisma, PrismaClient } from '@prisma/client'
import { DeleteManyDto } from 'utils/Common.dto'
import { removeDiacritics, customPaginate } from 'utils/Helps'
import { userDetailSelect, userSelect } from 'responses/user.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ChangeMyInformation } from 'src/auth/dto/change-information.dto'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateUserDto, accountId: string, shopId: string) {
    return this.prisma.$transaction(async prisma => {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          code: data.code,
          phone: data.phone,
          email: data.email,
          sex: data.sex,
          birthday: data.birthday,
          cardDate: data.cardDate,
          startDate: data.startDate,
          employeeGroupId: data.employeeGroupId,
          photoURL: data.photoURL,
          address: data.address,
          cardId: data.cardId,
          cardAddress: data.cardAddress,
          createdBy: accountId,
          account: {
            create: {
              password: bcrypt.hashSync(data.password, 10),
              status: data.status,
              branches: {
                connect: data.branchIds.map(id => ({
                  id,
                  shopId
                }))
              },
              roles: {
                connect: data.roleIds.map(id => ({ id }))
              }
            }
          }
        },
        select: userSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'User',
          targetName: user.name,
          targetId: user.id
        },
        { shopId },
        accountId
      )

      return user
    })
  }

  async findAll(params: FindManyUserDto, shopId: string) {
    const { page, perPage, keyword, employeeGroupIds, orderBy } = params

    const keySearch = ['name', 'code', 'email', 'phone']

    const where: Prisma.UserWhereInput = {
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      ...(employeeGroupIds?.length && {
        employeeGroup: {
          id: { in: employeeGroupIds }
        }
      }),
      account: {
        branches: {
          some: {
            shopId
          }
        }
      }
    }

    return await customPaginate(
      this.prisma.user,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: userSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, shopId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id,
        account: {
          branches: {
            some: {
              shopId
            }
          }
        }
      },
      select: userDetailSelect
    })
  }

  async update(id: string, data: UpdateUserDto, accountId: string, shopId: string) {
    return this.prisma.$transaction(async prisma => {
      const user = await prisma.user.update({
        data: {
          name: data.name,
          code: data.code,
          phone: data.phone,
          email: data.email,
          sex: data.sex,
          birthday: data.birthday,
          cardDate: data.cardDate,
          startDate: data.startDate,
          employeeGroupId: data.employeeGroupId,
          photoURL: data.photoURL,
          address: data.address,
          cardId: data.cardId,
          cardAddress: data.cardAddress,
          account: {
            update: {
              status: data.status,
              ...(data.newPassword && {
                password: bcrypt.hashSync(data.newPassword, 10)
              }),
              ...(data.roleIds?.length && {
                roles: {
                  set: data.roleIds.map(id => ({ id }))
                }
              })
            }
          },
          updatedBy: accountId
        },
        where: {
          id,
          account: {
            branches: {
              some: {
                shopId
              }
            }
          }
        },
        select: userSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'User',
          targetId: user.id,
          targetName: user.name
        },
        { shopId },
        accountId
      )

      return user
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, shopId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.user.findMany({
        where: { id: { in: data.ids } },
        include: {
          account: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        accountId,
        modelName: 'User',
        entities
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'User',
            targetName: entities.map(item => item.name).join(', ')
          },
          { shopId },
          accountId
        )
      ])

      return prisma.user.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          account: {
            branches: {
              some: {
                shopId
              }
            }
          }
        }
      })
    })
  }

  async checkExists(data: CheckUniqDto) {
    const { field, id, value } = data

    let record = null

    record = await this.prisma.user.findFirst({
      where: {
        [field]: value,
        id: { not: id }
      }
    })

    return record !== null
  }

  async uploadMyInformation(data: ChangeMyInformation, accountId: string) {
    console.log(accountId)

    const user = await this.prisma.user.findFirst({
      where: {
        account: {
          id: accountId
        }
      }
    })

    return this.prisma.user.update({
      data: { photoURL: data.photoURL },
      where: {
        id: user.id
      }
    })
  }
}
