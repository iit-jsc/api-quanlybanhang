import { OrderDetailStatus, Prisma, PrismaClient } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  AddDishByCustomerDto,
  AddDishDto,
  CreateTableDto,
  FindManyTableDto,
  UpdateTableDto
} from './dto/table.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { customPaginate, getOrderDetails, removeDiacritics } from 'utils/Helps'
import { tableSelect } from 'responses/table.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { TableGateway } from 'src/gateway/table.gateway'

@Injectable()
export class TableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly tableGateway: TableGateway
  ) {}

  async create(data: CreateTableDto, accountId: string, branchId: string) {
    return await this.prisma.table.create({
      data: {
        name: data.name,
        seat: data.seat,
        areaId: data.areaId,
        branchId,
        createdBy: accountId
      }
    })
  }

  async findAll(params: FindManyTableDto, branchId: string) {
    const { page, perPage, keyword, areaIds, orderBy } = params

    const keySearch = ['name', 'code']

    const where: Prisma.TableWhereInput = {
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      ...(areaIds?.length && {
        area: {
          id: { in: areaIds }
        }
      }),
      branchId
    }

    return await customPaginate(
      this.prisma.table,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: tableSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(where: Prisma.TableWhereUniqueInput) {
    return this.prisma.table.findUniqueOrThrow({
      where: {
        ...where
      },
      select: tableSelect
    })
  }

  async update(id: string, data: UpdateTableDto, accountId: string, branchId: string) {
    return await this.prisma.table.update({
      where: {
        id,
        branchId
      },
      data: {
        name: data.name,
        seat: data.seat,
        areaId: data.areaId,
        updatedBy: accountId
      }
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'Table'
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.table.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
  }

  async addDish(data: AddDishDto, accountId: string, branchId: string) {
    const orderDetails = await getOrderDetails(
      data.orderProducts,
      OrderDetailStatus.APPROVED,
      accountId,
      branchId
    )

    const table = await this.prisma.table.update({
      where: { id: data.tableId },
      data: {
        orderDetails: {
          createMany: {
            data: orderDetails
          }
        }
      },
      select: tableSelect
    })

    // Bắn socket cho nhân viên trong chi nhánh
    await this.tableGateway.handleModifyTable(table)

    return table
  }

  async addDishByCustomer(data: AddDishByCustomerDto) {
    const orderDetails = await getOrderDetails(
      data.orderProducts,
      OrderDetailStatus.WAITING,
      null,
      data.branchId
    )

    const table = await this.prisma.table.update({
      where: { id: data.tableId },
      data: {
        orderDetails: {
          createMany: {
            data: orderDetails
          }
        }
      },
      select: tableSelect
    })

    // Bắn socket cho nhân viên trong chi nhánh
    await this.tableGateway.handleModifyTable(table)

    return table
  }
}
