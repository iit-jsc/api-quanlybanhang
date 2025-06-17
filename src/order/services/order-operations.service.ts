import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CancelOrderDto, SaveOrderDto } from '../dto/order.dto'
import { ActivityAction, OrderStatus, PaymentStatus } from '@prisma/client'
import { orderSelect } from 'responses/order.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'

@Injectable()
export class OrderOperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly orderGatewayHandler: OrderGatewayHandler
  ) {}

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
        select: orderSelect
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
        select: orderSelect
      })

      if (order.paymentStatus === PaymentStatus.SUCCESS)
        throw new HttpException('Đơn hàng này đã thành toán!', HttpStatus.BAD_REQUEST)

      // Check if any orderDetails have a non-null tableId
      if (order.orderDetails && order.orderDetails.some(od => od.tableId)) {
        throw new HttpException(
          'Đơn này có món đang được xử lý không thể hủy!',
          HttpStatus.BAD_REQUEST
        )
      }

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
}
