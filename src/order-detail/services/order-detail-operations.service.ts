import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CancelOrderDetailsDto } from '../dto/order-detail.dto'
import { orderDetailSelect } from 'responses/order-detail.response'
import { NotifyService } from 'src/notify/notify.service'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'

@Injectable()
export class OrderDetailOperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler,
    private readonly notifyService: NotifyService
  ) {}

  async cancel(
    id: string,
    data: CancelOrderDetailsDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    const result = await this.prisma.$transaction(async prisma => {
      const orderDetail = await prisma.orderDetail.findUniqueOrThrow({
        where: { id, branchId },
        select: {
          amount: true,
          productOrigin: {
            select: {
              name: true
            }
          },
          order: {
            select: {
              isPaid: true,
              code: true
            }
          }
        }
      })

      // Kiểm tra số lượng hủy
      if (data.amount > orderDetail.amount) {
        throw new HttpException(
          `Số lượng hủy (${data.amount}) không được lớn hơn số lượng hiện tại (${orderDetail.amount})`,
          HttpStatus.BAD_REQUEST
        )
      }

      // Kiểm tra đơn đã thanh toán chưa
      if (orderDetail.order && orderDetail.order.isPaid) {
        throw new HttpException(
          `Món này thuộc đơn #${orderDetail.order.code} đã thanh toán không thể hủy!`,
          HttpStatus.BAD_REQUEST
        )
      }

      // Tạo mới canceledOrderDetail
      await prisma.canceledOrderDetail.create({
        data: {
          orderDetailId: id,
          amount: data.amount,
          cancelReason: data.cancelReason,
          createdBy: accountId
        }
      })

      // Cập nhật orderDetail
      const newOrderDetail = await prisma.orderDetail.update({
        where: { id, branchId },
        data: {
          amount: {
            decrement: data.amount
          }
        },
        select: orderDetailSelect
      })

      return newOrderDetail
    })

    const tableName = result?.table?.name
    const orderCode = result?.order?.code
    const productName = (result.product as { name: string })?.name

    let contentPrefix = 'Món đã hủy'
    if (tableName) {
      contentPrefix = `${tableName} đã hủy`
    } else if (orderCode) {
      contentPrefix = `Đơn #${orderCode} đã hủy`
    }

    await Promise.all([
      this.orderDetailGatewayHandler.handleCancelOrderDetails(result, branchId, deviceId),
      this.notifyService.create(
        {
          type: 'CANCEL_DISH',
          content: `${contentPrefix} (${data.amount}) ${productName}` // đã được lấy ra trước từ transaction
        },
        branchId,
        deviceId
      )
    ])

    return result
  }
}
