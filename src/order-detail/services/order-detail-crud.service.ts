import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { FindManyOrderDetailDto, UpdateOrderDetailDto } from '../dto/order-detail.dto'
import { customPaginate } from 'utils/Helps'
import { orderDetailSelect } from 'responses/order-detail.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'

@Injectable()
export class OrderDetailCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler
  ) {}

  async findAll(params: FindManyOrderDetailDto, branchId: string) {
    const { page, perPage, orderBy, statuses, orderTypes, from, to, hasTable, filterBy } = params

    const where: Prisma.OrderDetailWhereInput = {
      branchId,
      ...(from &&
        to && {
          [filterBy]: {
            gte: new Date(from),
            lte: new Date(to)
          }
        }),
      ...(from &&
        !to && {
          [filterBy]: {
            gte: new Date(from)
          }
        }),
      ...(!from &&
        to && {
          [filterBy]: {
            lte: new Date(to)
          }
        }),
      ...(statuses?.length && {
        status: {
          in: statuses
        }
      }),
      ...(orderTypes?.length && {
        order: {
          type: { in: orderTypes }
        }
      }),
      ...(typeof hasTable !== 'undefined' && {
        tableId: {
          not: null
        }
      }),
      OR: [
        {
          AND: [
            {
              order: {
                isNot: null
              }
            },
            {
              order: {
                isDraft: false
              }
            }
          ]
        },
        {
          tableId: {
            not: null
          }
        }
      ]
    }

    return await customPaginate(
      this.prisma.orderDetail,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: orderDetailSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async update(
    id: string,
    data: UpdateOrderDetailDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    const orderDetailRecord = await this.prisma.orderDetail.findUnique({
      where: { id, branchId },
      select: {
        id: true,
        order: {
          select: {
            paymentStatus: true,
            code: true,
            status: true
          }
        }
      }
    })

    // Kiểm tra đã tạo đơn chưa
    if (orderDetailRecord.order) {
      throw new HttpException(
        `Món thuộc đơn ${orderDetailRecord.order.code} không thể cập nhật!`,
        HttpStatus.CONFLICT
      )
    }

    let orderDetail = null

    if (data.amount === 0) {
      orderDetail = await this.prisma.orderDetail.delete({ where: { id, branchId } })
      await this.orderDetailGatewayHandler.handleDeleteOrderDetails(orderDetail, branchId, deviceId)
    }

    if (data.amount !== 0) {
      orderDetail = await this.prisma.orderDetail.update({
        where: {
          id,
          branchId
        },
        data: {
          amount: data.amount,
          note: data.note,
          updatedBy: accountId
        },
        select: orderDetailSelect
      })

      await this.orderDetailGatewayHandler.handleUpdateOrderDetails(orderDetail, branchId, deviceId)
    }

    return orderDetail
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string, deviceId: string) {
    const result = await this.prisma.$transaction(async (prisma: PrismaClient) => {
      await this.checkOrderPaidByDetailIds(data.ids)

      const entities = await prisma.orderDetail.findMany({
        where: { id: { in: data.ids } },
        include: {
          order: true,
          table: true,
          canceledOrderDetails: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'OrderDetail'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        prisma.orderDetail.deleteMany({
          where: {
            id: {
              in: data.ids
            },
            branchId
          }
        })
      ])

      return entities
    })

    await this.orderDetailGatewayHandler.handleDeleteOrderDetails(result, branchId, deviceId)

    return result
  }

  async checkOrderPaidByDetailIds(orderDetailIds: string[]) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderDetails: {
          some: {
            id: {
              in: orderDetailIds
            }
          }
        }
      },
      select: {
        id: true,
        code: true
      }
    })

    if (order)
      throw new HttpException(
        'Không thể cập nhật/xóa vì món thuộc đơn #' + order.code + '!',
        HttpStatus.CONFLICT
      )
  }
}
