import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { UpdateStatusOrderDetailsDto } from '../dto/order-detail.dto'
import { OrderDetailStatus, PrismaClient } from '@prisma/client'
import { orderDetailSelect } from 'responses/order-detail.response'
import { getNotifyInfo } from 'helpers'
import { NotifyService } from 'src/notify/notify.service'
import { IOrderDetail } from 'interfaces/orderDetail.interface'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'
import { MAX_WAIT, TIMEOUT } from 'enums/common.enum'

const statusLevel: Record<OrderDetailStatus, number> = {
  [OrderDetailStatus.APPROVED]: 1,
  [OrderDetailStatus.INFORMED]: 2,
  [OrderDetailStatus.PROCESSING]: 3,
  [OrderDetailStatus.SUCCESS]: 4
}

@Injectable()
export class OrderDetailStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler,
    private readonly notifyService: NotifyService
  ) {}

  async updateStatusOrderDetails(
    data: UpdateStatusOrderDetailsDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    const result = await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        const currentDetails = await this.getCurrentDetails(data.orderDetails, branchId, prisma)
        const detailsMap = new Map(currentDetails.map(detail => [detail.id, detail])) as Map<
          string,
          any
        >

        const { updatePromises, newOrderDetails } = this.buildUpdatePromises(
          data,
          detailsMap,
          accountId,
          branchId,
          prisma
        )

        const updateOrderDetail = await Promise.all(updatePromises)

        return [...updateOrderDetail, ...newOrderDetails]
      },
      {
        timeout: TIMEOUT,
        maxWait: MAX_WAIT
      }
    )

    await this.handleNotifications(data.status, result, branchId, deviceId)

    return result
  }

  private async getCurrentDetails(orderDetails: any[], branchId: string, prisma: PrismaClient) {
    return prisma.orderDetail.findMany({
      where: {
        id: { in: orderDetails.map(detail => detail.id) },
        branchId
      }
    })
  }

  private buildUpdatePromises(
    data: UpdateStatusOrderDetailsDto,
    detailsMap: Map<string, any>,
    accountId: string,
    branchId: string,
    prisma: PrismaClient
  ) {
    const newOrderDetails = []

    const updatePromises = data.orderDetails.map(async (detail: IOrderDetail) => {
      const currentDetail = detailsMap.get(detail.id)

      this.validateOrderDetail(detail, currentDetail)

      if (detail.amount !== currentDetail.amount) {
        return this.handlePartialUpdate(
          detail,
          currentDetail,
          data.status,
          accountId,
          branchId,
          prisma,
          newOrderDetails
        )
      }

      return this.handleFullUpdate(detail, data.status, accountId, branchId, prisma)
    })

    return { updatePromises, newOrderDetails }
  }

  private validateOrderDetail(detail: IOrderDetail, currentDetail: any) {
    if (!currentDetail) {
      throw new HttpException('Không tìm thấy chi tiết món!', HttpStatus.NOT_FOUND)
    }

    if (detail.amount > currentDetail.amount) {
      throw new HttpException(
        `Số lượng vượt quá: còn lại ${currentDetail.amount}, yêu cầu ${detail.amount}`,
        HttpStatus.CONFLICT
      )
    }

    if (detail.status && statusLevel[detail.status] < statusLevel[currentDetail.status]) {
      throw new HttpException(
        `Không được cập nhật trạng thái từ ${currentDetail.status} về ${detail.status}`,
        HttpStatus.CONFLICT
      )
    }
  }

  private async handlePartialUpdate(
    detail: IOrderDetail,
    currentDetail: any,
    status: OrderDetailStatus,
    accountId: string,
    branchId: string,
    prisma: PrismaClient,
    newOrderDetails: any[]
  ) {
    const statusData = this.buildStatusData(status)

    const [newOrderDetail, updatedOldDetail] = await Promise.all([
      prisma.orderDetail.create({
        data: {
          ...statusData,
          ...currentDetail,
          id: undefined,
          amount: detail.amount,
          status,
          updatedBy: accountId
        },
        select: orderDetailSelect
      }),
      prisma.orderDetail.update({
        where: { id: detail.id, branchId },
        data: {
          ...statusData,
          amount: { decrement: detail.amount },
          updatedBy: accountId
        },
        select: orderDetailSelect
      })
    ])

    newOrderDetails.push(newOrderDetail)
    return updatedOldDetail
  }

  private async handleFullUpdate(
    detail: IOrderDetail,
    status: OrderDetailStatus,
    accountId: string,
    branchId: string,
    prisma: PrismaClient
  ) {
    const statusData = this.buildStatusData(status)

    return prisma.orderDetail.update({
      where: { id: detail.id, branchId },
      data: {
        status,
        updatedBy: accountId,
        amount: detail.amount,
        ...statusData
      },
      select: orderDetailSelect
    })
  }

  private buildStatusData(status: OrderDetailStatus) {
    const now = new Date()
    const statusData: any = {}

    switch (status) {
      case OrderDetailStatus.INFORMED:
        statusData.informAt = now
        break
      case OrderDetailStatus.SUCCESS:
        statusData.successAt = now
        break
      case OrderDetailStatus.PROCESSING:
        statusData.processingAt = now
        break
    }

    return statusData
  }

  private async handleNotifications(
    status: OrderDetailStatus,
    result: any[],
    branchId: string,
    deviceId: string
  ) {
    const notify = getNotifyInfo(status)
    const allowedStatuses = ['INFORMED']
    const finalStatus = status ?? result?.[0]?.status

    const asyncTasks = [
      this.orderDetailGatewayHandler
        .handleUpdateOrderDetails(result, branchId, deviceId)
        .catch(err => console.error('Socket thất bại:', err))
    ]

    if (finalStatus && allowedStatuses.includes(finalStatus)) {
      asyncTasks.push(
        this.notifyService
          .create(
            {
              type: notify.type,
              content: `Có món ${notify.content}!`
            },
            branchId,
            deviceId
          )
          .catch(err => console.error('Notify thất bại:', err))
      )
    }

    await Promise.all(asyncTasks)
  }
}
