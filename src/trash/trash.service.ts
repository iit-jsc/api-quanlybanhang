import { Prisma, PrismaClient } from '@prisma/client'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateManyTrashDto, CreateTrashDto, FindManyTrashDto } from './dto/trash.dto'
import { customPaginate } from 'utils/Helps'

@Injectable()
export class TrashService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ id, modelName, accountId, include = {} }: CreateTrashDto, prisma: PrismaClient) {
    const data = await prisma[modelName].findUniqueOrThrow({
      where: { id },
      include
    })

    await prisma.trash.create({
      data: {
        modelName,
        data,
        createdBy: accountId
      }
    })
  }

  async createMany(
    { ids, modelName, accountId, include = {} }: CreateManyTrashDto,
    prisma: PrismaClient
  ) {
    const entities = await prisma[modelName].findMany({
      where: { id: { in: ids } },
      include
    })

    if (entities.length === 0) {
      throw new HttpException(`Không tìm thấy dữ liệu!`, HttpStatus.NOT_FOUND)
    }

    return await Promise.all(
      entities.map(async entity => {
        await prisma.trash.create({
          data: {
            modelName,
            data: entity,
            createdBy: accountId
          }
        })
      })
    )
  }

  async findMany(data: FindManyTrashDto) {
    const { page, perPage, orderKey, orderValue } = data

    const where: Prisma.TrashWhereInput = {}

    return await customPaginate(
      this.prisma.trash,
      {
        where,
        orderBy: {
          [orderKey]: orderValue
        }
      },
      {
        page,
        perPage
      }
    )
  }
}
