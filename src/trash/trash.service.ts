import { Prisma, PrismaClient } from '@prisma/client'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateManyTrashDto, CreateTrashDto, FindManyTrashDto } from './dto/trash.dto'
import { customPaginate } from 'utils/Helps'

@Injectable()
export class TrashService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTrashDto, prisma: PrismaClient) {
    const { entity, modelName, accountId } = data

    await prisma.trash.create({
      data: {
        modelName,
        data: entity,
        createdBy: accountId
      }
    })
  }

  async createMany({ entities, modelName, accountId }: CreateManyTrashDto, prisma: PrismaClient) {
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
