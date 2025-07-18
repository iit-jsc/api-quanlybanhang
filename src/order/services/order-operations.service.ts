import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CancelOrderDto, SaveOrderDto } from '../dto/order.dto'
import { ActivityAction, PaymentStatus } from '@prisma/client'
import { orderSelect } from 'responses/order.response'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { UpdatePaymentDto } from '../dto/payment.dto'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'

@Injectable()
export class OrderOperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly orderGatewayHandler: OrderGatewayHandler,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler
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
      const newOrderDetails = []
      const order = await prisma.order.update({
        where: {
          id,
          branchId
        },
        data: {
          cancelDate: new Date(),
          cancelReason: data.cancelReason,
          updatedBy: accountId
        },
        select: orderSelect
      })

      for (const orderDetail of order.orderDetails || []) {
        // Update each order detail to cancelled status
        const odd = await prisma.orderDetail.update({
          where: { id: orderDetail.id },
          data: {
            amount: 0,
            canceledOrderDetails: {
              create: {
                amount: orderDetail.amount,
                cancelReason: 'Hủy đơn',
                createdBy: accountId
              }
            }
          }
        })

        newOrderDetails.push(odd)
      }

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

      await Promise.all([
        this.orderGatewayHandler.handleCancelOrder(order, branchId, deviceId),
        this.orderDetailGatewayHandler.handleCancelOrderDetails(newOrderDetails, branchId, deviceId)
      ])

      return order
    })
  }
  async updatePayment(id: string, data: UpdatePaymentDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      // Kiểm tra trạng thái payment hiện tại
      const existingOrder = await prisma.order.findFirstOrThrow({
        where: { id, branchId },
        select: { paymentStatus: true }
      })

      if (
        existingOrder.paymentStatus === PaymentStatus.SUCCESS ||
        existingOrder.paymentStatus === PaymentStatus.FAILED
      ) {
        throw new HttpException('Không thể cập nhật trạng thái đơn này.', HttpStatus.BAD_REQUEST)
      }

      return await prisma.order.update({
        where: { id, branchId },
        data: { paymentStatus: data.paymentStatus, updatedBy: accountId },
        select: orderSelect
      })
    })
  }
}
