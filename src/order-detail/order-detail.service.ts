import { PrismaService } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
  FindManyOrderDetailDto,
  UpdateOrderDetailDto,
  UpdateStatusOrderDetailsDto
} from './dto/order-detail.dto'
import { ActivityAction, NotifyType, OrderDetailStatus, Prisma, PrismaClient } from '@prisma/client'
import { customPaginate } from 'utils/Helps'
import { orderDetailSelect } from 'responses/order-detail.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { IProduct } from 'interfaces/product.interface'
import { OrderDetailGateway } from 'src/gateway/order-detail.gateway'
import { NotifyService } from 'src/notify/notify.service'

@Injectable()
export class OrderDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService,
    private readonly orderDetailGateway: OrderDetailGateway,
    private readonly notifyService: NotifyService
  ) {}

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      await this.checkOrderPaidByDetailIds(data.ids)

      const entities = await prisma.orderDetail.findMany({
        where: { id: { in: data.ids } },
        include: {
          order: true,
          table: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'OrderDetail'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'OrderDetail',
            targetName: entities
              .map(item => `${(item.product as unknown as IProduct)?.name} (${item.amount})`)
              .join(', '),
            relatedName: entities[0].orderId ? entities[0].order?.code : entities[0].table?.name,
            targetId: entities[0].orderId ? entities[0].orderId : entities[0].tableId,
            relatedModel: entities[0].orderId ? 'Order' : 'Table'
          },
          { branchId },
          accountId
        ),
        this.orderDetailGateway.handleModifyOrderDetails(entities, branchId)
      ])

      return prisma.orderDetail.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
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
        },
        isPaid: true
      },
      select: {
        id: true
      }
    })

    if (order)
      throw new HttpException(
        'Đơn hàng này không thể cập nhật vì đã thanh toán!',
        HttpStatus.CONFLICT
      )
  }

  async findAll(params: FindManyOrderDetailDto, branchId: string) {
    const { page, perPage, orderBy, statuses, orderTypes, from, to, hasTable } = params

    const where: Prisma.OrderDetailWhereInput = {
      branchId,
      ...(from &&
        to && {
          createdAt: {
            gte: new Date(from),
            lte: new Date(to)
          }
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: new Date(from)
          }
        }),
      ...(!from &&
        to && {
          createdAt: {
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
      })
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

  async update(id: string, data: UpdateOrderDetailDto, accountId: string, branchId: string) {
    await this.checkOrderPaidByDetailIds([id])

    const orderDetail = await this.prisma.orderDetail.update({
      where: {
        id,
        branchId
      },
      data: {
        amount: data.amount,
        note: data.note,
        status: data.status,
        updatedBy: accountId
      },
      select: orderDetailSelect
    })

    await this.orderDetailGateway.handleModifyOrderDetail(orderDetail, branchId)

    return orderDetail
  }

  async updateStatusOrderDetails(
    data: UpdateStatusOrderDetailsDto,
    accountId: string,
    branchId: string
  ) {
    await this.checkOrderPaidByDetailIds(data.ids)

    const updatedOrderDetails = await this.prisma.$transaction(async prisma => {
      const updatePromises = data.ids.map(id =>
        prisma.orderDetail.update({
          where: {
            id,
            branchId
          },
          data: {
            status: data.status,
            updatedBy: accountId
          },
          include: {
            order: true,
            table: true
          }
        })
      )

      const results = await Promise.all(updatePromises)

      const notifyInfo = this.getNotifyInfo(data.status, {
        orderCode: results[0].order?.code,
        tableName: results[0].table?.name
      })

      await Promise.all([
        this.orderDetailGateway.handleModifyOrderDetails(results, branchId),
        this.activityLogService.create(
          {
            action: this.getActivityActionByStatus(data.status),
            modelName: 'OrderDetail',
            relatedName: results[0].orderId ? results[0].order?.code : results[0].table?.name,
            targetName: results
              .map(item => `${(item.product as unknown as IProduct)?.name} (${item.amount})`)
              .join(', '),
            relatedModel: results[0].orderId ? 'Order' : 'Table'
          },
          { branchId },
          accountId
        ),
        this.notifyService.create({
          branchId,
          type: notifyInfo.type,
          modelName: notifyInfo.modelName,
          targetName: notifyInfo.targetName
        })
      ])
      return results
    })

    return updatedOrderDetails
  }

  getNotifyInfo(
    status: OrderDetailStatus,
    target: { orderCode: string; tableName: string }
  ): { type: NotifyType; targetName: string; modelName: Prisma.ModelName } {
    const targetName = target.orderCode ? target.orderCode : target.tableName
    const modelName = target.orderCode ? 'Order' : 'Table'

    if (status === OrderDetailStatus.PROCESSING) {
      return { type: NotifyType.SEND_TO_KITCHEN, targetName, modelName }
    }

    if (status === OrderDetailStatus.TRANSPORTING) {
      return { type: NotifyType.TRANSPORT_DISH, targetName, modelName }
    }

    if (status === OrderDetailStatus.CANCELLED) {
      return { type: NotifyType.CANCEL_DISH, targetName, modelName }
    }
  }

  getActivityActionByStatus(status: OrderDetailStatus) {
    if (status === OrderDetailStatus.APPROVED) {
      return ActivityAction.APPROVE_DISH
    }

    if (status === OrderDetailStatus.PROCESSING) {
      return ActivityAction.SEND_TO_KITCHEN
    }

    if (status === OrderDetailStatus.TRANSPORTING) {
      return ActivityAction.TRANSPORT_DISH
    }

    if (status === OrderDetailStatus.SUCCESS) {
      return ActivityAction.SUCCESS_DISH
    }

    if (status === OrderDetailStatus.CANCELLED) {
      return ActivityAction.CANCEL_DISH
    }
  }
}
