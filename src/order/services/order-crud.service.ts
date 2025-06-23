import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateOrderDto, FindManyOrderDto, UpdateOrderDto } from '../dto/order.dto'
import {
  ActivityAction,
  OrderDetailStatus,
  OrderStatus,
  OrderType,
  PaymentStatus,
  Prisma,
  PrismaClient
} from '@prisma/client'
import {
  customPaginate,
  generateCode,
  getOrderDetails,
  getOrderTotal,
  removeDiacritics
} from 'utils/Helps'
import { orderSelect } from 'responses/order.response'
import { DeleteManyDto } from 'utils/Common.dto'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'

@Injectable()
export class OrderCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderGatewayHandler: OrderGatewayHandler,
    private readonly trashService: TrashService,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateOrderDto, accountId: string, branchId: string, deviceId: string) {
    const orderDetails = await getOrderDetails(
      data.orderProducts,
      OrderDetailStatus.INFORMED,
      accountId,
      branchId
    )

    const orderTotalNotDiscount = getOrderTotal(orderDetails)

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const order = await prisma.order.create({
        data: {
          note: data.note,
          type: data.type || OrderType.OFFLINE,
          status: data.status || OrderStatus.APPROVED,
          code: generateCode('DH', 15),
          orderTotal: orderTotalNotDiscount,
          ...(data.customerId && {
            customerId: data.customerId
          }),
          orderDetails: {
            createMany: {
              data: orderDetails
            }
          },
          branchId,
          createdBy: accountId
        },
        select: orderSelect
      })

      await Promise.all([
        this.activityLogService.create(
          {
            action: ActivityAction.CREATE,
            modelName: 'Order',
            targetName: order.code,
            targetId: order.id
          },
          { branchId },
          accountId
        ),
        this.orderGatewayHandler.handleCreateOrder(order, branchId, deviceId),
        this.orderDetailGatewayHandler.handleCreateOrderDetails(
          order.orderDetails,
          branchId,
          deviceId
        )
      ])

      return order
    })
  }

  async update(
    id: string,
    data: UpdateOrderDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.prisma.$transaction(async prisma => {
      const order = await prisma.order.update({
        where: {
          id,
          branchId
        },
        data: {
          status: data.status,
          note: data.note,
          bankingImages: data.bankingImages,
          updatedBy: accountId
        },
        select: orderSelect
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'Order',
          targetId: order.id,
          targetName: order.code
        },
        { branchId },
        accountId
      )

      await this.orderGatewayHandler.handleUpdateOrder(order, branchId, deviceId)

      return order
    })
  }

  async findAll(params: FindManyOrderDto, branchId: string) {
    const {
      page,
      perPage,
      keyword,
      customerId,
      from,
      to,
      types,
      paymentStatus,
      orderBy,
      isSave,
      statuses
    } = params

    const keySearch = ['code']

    const where: Prisma.OrderWhereInput = {
      branchId,
      isDraft: false,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      ...(customerId && {
        customerId: customerId
      }),
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
      ...(types?.length && {
        type: { in: types }
      }),
      ...(statuses?.length && {
        status: { in: statuses }
      }),
      ...(paymentStatus && { paymentStatus: paymentStatus }),
      ...(typeof isSave !== 'undefined' && { isSave: isSave })
    }

    return await customPaginate(
      this.prisma.order,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: orderSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, branchId: string) {
    return this.prisma.order.findFirstOrThrow({
      where: {
        id,
        branchId
      },
      select: orderSelect
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string, deviceId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities: any = await prisma.order.findMany({
        where: { id: { in: data.ids } },
        include: {
          orderDetails: true
        }
      })

      const dataTrash: CreateManyTrashDto = {
        accountId,
        modelName: 'Order',
        entities
      }

      await prisma.orderDetail.deleteMany({
        where: {
          orderId: {
            in: data.ids
          }
        }
      })

      const order = await prisma.order.deleteMany({
        where: {
          id: { in: data.ids },
          branchId,
          paymentStatus: PaymentStatus.UNPAID
        }
      })

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'Order',
            targetName: entities.map(item => item.code).join(', ')
          },
          { branchId },
          accountId
        ),
        this.orderGatewayHandler.handleDeleteOrder(order, branchId, deviceId),
        this.orderDetailGatewayHandler.handleDeleteOrderDetails(
          entities.orderDetails,
          branchId,
          deviceId
        )
      ])

      return order
    })
  }
}
