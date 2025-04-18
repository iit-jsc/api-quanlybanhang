import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  CancelOrderDto,
  CreateOrderDto,
  FindManyOrderDto,
  SaveOrderDto,
  UpdateOrderDto
} from './dto/order.dto'
import {
  ActivityAction,
  OrderDetailStatus,
  OrderStatus,
  OrderType,
  Prisma,
  PrismaClient
} from '@prisma/client'
import {
  customPaginate,
  generateCode,
  getCustomerDiscount,
  getDiscountCode,
  getOrderDetails,
  getOrderTotal,
  getVoucher,
  handleOrderDetailsBeforePayment,
  removeDiacritics
} from 'utils/Helps'
import { orderSelect, orderSortSelect } from 'responses/order.response'
import { PaymentOrderDto } from './dto/payment.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderGatewayHandler: OrderGatewayHandler,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateOrderDto, accountId: string, branchId: string, deviceId: string) {
    const orderDetails = await getOrderDetails(
      data.orderProducts,
      OrderDetailStatus.APPROVED,
      accountId,
      branchId
    )

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const order = await prisma.order.create({
        data: {
          note: data.note,
          type: data.type || OrderType.OFFLINE,
          status: data.status || OrderStatus.APPROVED,
          code: generateCode('DH'),
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
        select: orderSortSelect
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
        this.orderGatewayHandler.handleCreateOrder(order, branchId, deviceId)
      ])

      return order
    })
  }

  async payment(
    id: string,
    data: PaymentOrderDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      await handleOrderDetailsBeforePayment(prisma, { orderId: id })

      const order = await prisma.order.findFirstOrThrow({
        where: { id },
        select: orderSortSelect
      })

      if (order.isPaid) throw new HttpException('Đơn hàng này đã thành toán!', HttpStatus.CONFLICT)

      const orderTotal = getOrderTotal(order.orderDetails)

      const voucherParams = {
        voucherId: data.voucherId,
        branchId,
        orderDetails: order.orderDetails,
        voucherCheckRequest: {
          orderTotal
        }
      }

      const [voucher, discountCodeValue, customerDiscountValue] = await Promise.all([
        getVoucher(voucherParams, prisma),
        getDiscountCode(data.discountCode, orderTotal, branchId, prisma),
        getCustomerDiscount(data.customerId, orderTotal, prisma)
      ])

      const newOrder = await prisma.order.update({
        where: { id },
        data: {
          isPaid: true,
          note: data.note,
          type: data.type,
          voucherProducts: voucher.voucherProducts,
          voucherValue: voucher.voucherValue,
          discountCodeValue,
          customerDiscountValue,
          moneyReceived: data.moneyReceived,
          status: data.status || OrderStatus.SUCCESS,
          bankingImages: data.bankingImages,
          customerId: data.customerId,
          paymentMethodId: data.paymentMethodId,
          paymentAt: new Date(),
          updatedBy: accountId
        },
        select: orderSortSelect
      })

      await Promise.all([
        this.activityLogService.create(
          {
            action: ActivityAction.PAYMENT,
            modelName: 'Order',
            targetName: order.code,
            targetId: order.id
          },
          { branchId },
          accountId
        ),
        this.orderGatewayHandler.handleCreateOrder(order, branchId, deviceId)
      ])

      return newOrder
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
        select: orderSortSelect
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
      isPaid,
      orderBy,
      isSave,
      statuses
    } = params

    const keySearch = ['code']

    const where: Prisma.OrderWhereInput = {
      branchId,
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
      ...(typeof isPaid !== 'undefined' && { isPaid: isPaid }),
      ...(typeof isSave !== 'undefined' && { isSave: isSave })
    }

    return await customPaginate(
      this.prisma.order,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: orderSortSelect
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

  async save(id: string, data: SaveOrderDto, branchId: string, deviceId: string) {
    return this.prisma.$transaction(async prisma => {
      const order = await prisma.order.update({
        where: {
          id,
          branchId
        },
        data: {
          isSave: data.isSave,
          note: data.note
        },
        select: orderSortSelect
      })

      await this.orderGatewayHandler.handleUpdateOrder(order, branchId, deviceId)

      return order
    })
  }

  async cancel(
    id: string,
    data: CancelOrderDto,
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
          cancelDate: new Date(),
          cancelReason: data.cancelReason,
          status: OrderStatus.CANCELLED,
          updatedBy: accountId
        },
        select: orderSortSelect
      })

      if (order.isPaid) throw new HttpException('Đơn hàng này đã thành toán!', HttpStatus.CONFLICT)

      await this.activityLogService.create(
        {
          action: ActivityAction.CANCEL_ORDER,
          modelName: 'Order',
          targetId: order.id,
          targetName: order.code
        },
        { branchId },
        accountId
      )

      await this.orderGatewayHandler.handleCancelOrder(order, branchId, deviceId)

      return order
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string, deviceId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.order.findMany({
        where: { id: { in: data.ids } },
        include: {
          orderDetails: true
        }
      })

      const paidOrders = entities.filter(order => order.isPaid)

      if (paidOrders.length > 0)
        throw new HttpException(
          `Không thể xóa các đơn hàng đã thanh toán: ${paidOrders.map(o => o.code).join(', ')}`,
          HttpStatus.CONFLICT
        )

      const dataTrash: CreateManyTrashDto = {
        accountId,
        modelName: 'Order',
        entities
      }

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
        )
      ])

      const order = await prisma.order.deleteMany({
        where: {
          id: { in: data.ids },
          branchId,
          isPaid: false
        }
      })

      await this.orderGatewayHandler.handleDeleteOrder(order, branchId, deviceId)

      return order
    })
  }
}
