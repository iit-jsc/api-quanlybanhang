import { PrismaService } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
  CancelOrderDetailsDto,
  FindManyOrderDetailDto,
  UpdateOrderDetailDto,
  UpdateStatusOrderDetailsDto
} from './dto/order-detail.dto'
import { OrderDetailStatus, Prisma, PrismaClient } from '@prisma/client'
import { customPaginate, getNotifyInfo } from 'utils/Helps'
import { orderDetailSelect } from 'responses/order-detail.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { NotifyService } from 'src/notify/notify.service'
import { IOrderDetail } from 'interfaces/orderDetail.interface'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'

const statusLevel: Record<OrderDetailStatus, number> = {
  [OrderDetailStatus.APPROVED]: 1,
  [OrderDetailStatus.INFORMED]: 2,
  [OrderDetailStatus.PROCESSING]: 3,
  [OrderDetailStatus.SUCCESS]: 4
}

@Injectable()
export class OrderDetailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler,
    private readonly notifyService: NotifyService
  ) {}

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

  async update(
    id: string,
    data: UpdateOrderDetailDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    // Kiểm tra đơn hàng đã thanh toán chưa
    const orderDetailRecord = await this.prisma.orderDetail.findUnique({
      where: { id, branchId },
      select: {
        id: true,
        order: {
          select: {
            isPaid: true,
            code: true
          }
        }
      }
    })

    if (orderDetailRecord?.order?.isPaid) {
      throw new HttpException(
        `Đơn hàng này đã thanh toán, không thể cập nhật!`,
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

  async updateStatusOrderDetails(
    data: UpdateStatusOrderDetailsDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    const result = await this.prisma.$transaction(
      async prisma => {
        // Fetch all current details in one query to reduce database round-trips
        const currentDetails = await prisma.orderDetail.findMany({
          where: {
            id: { in: data.orderDetails.map(detail => detail.id) },
            branchId
          }
        })

        // Create a map for faster lookup
        const detailsMap = new Map(currentDetails.map(detail => [detail.id, detail]))

        const newOrderDetails = []

        const updatePromises = data.orderDetails.map(async (detail: IOrderDetail) => {
          const currentDetail = detailsMap.get(detail.id)

          if (!currentDetail)
            throw new HttpException('Không tìm thấy chi tiết món!', HttpStatus.NOT_FOUND)

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

          if (detail.amount !== currentDetail.amount) {
            const [newOrderDetail, updatedOldDetail] = await Promise.all([
              prisma.orderDetail.create({
                data: {
                  ...currentDetail,
                  id: undefined,
                  amount: detail.amount,
                  status: data.status,
                  ...(data.status === OrderDetailStatus.INFORMED && {
                    informAt: new Date()
                  }),
                  ...(data.status === OrderDetailStatus.SUCCESS && {
                    successAt: new Date()
                  }),
                  ...(data.status === OrderDetailStatus.PROCESSING && {
                    processingAt: new Date()
                  }),
                  updatedBy: accountId
                },
                select: orderDetailSelect
              }),
              prisma.orderDetail.update({
                where: { id: detail.id, branchId },
                data: {
                  amount: { decrement: detail.amount },
                  ...(data.status === OrderDetailStatus.INFORMED && {
                    informAt: new Date()
                  }),
                  ...(data.status === OrderDetailStatus.SUCCESS && {
                    successAt: new Date()
                  }),
                  ...(data.status === OrderDetailStatus.PROCESSING && {
                    processingAt: new Date()
                  }),
                  updatedBy: accountId
                },
                select: orderDetailSelect
              })
            ])

            newOrderDetails.push(newOrderDetail)

            return updatedOldDetail
          }

          return prisma.orderDetail.update({
            where: { id: detail.id, branchId },
            data: {
              status: data.status,
              updatedBy: accountId,
              amount: detail.amount,
              ...(data.status === OrderDetailStatus.INFORMED && {
                informAt: new Date()
              }),
              ...(data.status === OrderDetailStatus.SUCCESS && {
                successAt: new Date()
              }),
              ...(data.status === OrderDetailStatus.PROCESSING && {
                processingAt: new Date()
              })
            },
            select: orderDetailSelect
          })
        })

        const updateOrderDetail = await Promise.all(updatePromises)

        const results = [...updateOrderDetail, ...newOrderDetails]

        return results
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )

    // Chỉ bắn notify khi INFORMED
    const notify = getNotifyInfo(data.status)
    const allowedStatuses = ['INFORMED']
    const status = data.status ?? result?.[0]?.status

    const asyncTasks = [
      this.orderDetailGatewayHandler
        .handleUpdateOrderDetails(result, branchId, deviceId)
        .catch(err => console.error('Socket thất bại:', err))
    ]

    if (status && allowedStatuses.includes(status)) {
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

    return result
  }

  // getMessagesToNotify(orderDetails: any[], content: string): string[] {
  //   const groupedByTable: Record<string, ITableGroup> = {}

  //   for (const detail of orderDetails) {
  //     const fallbackId = detail.order?.code ?? 'unknown'
  //     const tableId = detail.table?.id ?? detail.tableId ?? fallbackId
  //     const tableName =
  //       detail.table?.name ?? (detail.order?.code ? `Đơn #${detail.order.code}` : 'Chưa rõ bàn')
  //     const areaName = detail.table?.area?.name ?? ''
  //     const productId = detail.product?.id ?? detail.productOriginId ?? 'unknown'
  //     const productName = detail.product?.name ?? detail.productOrigin?.name ?? 'Sản phẩm không tên'
  //     const amount = detail.amount ?? 0
  //     const status = detail.status

  //     if (!groupedByTable[tableId]) {
  //       groupedByTable[tableId] = {
  //         tableId,
  //         tableName,
  //         areaName,
  //         products: {}
  //       }
  //     }

  //     const productGroup = groupedByTable[tableId].products

  //     if (!productGroup[productId]) {
  //       productGroup[productId] = {
  //         productId,
  //         productName,
  //         totalAmount: 0,
  //         status
  //       }
  //     }

  //     productGroup[productId].totalAmount += amount
  //   }

  //   // Convert to notification messages
  //   return Object.values(groupedByTable).map(tableGroup => {
  //     const productMsgs = Object.values(tableGroup.products)
  //       .map(p => `(${p.totalAmount}) ${p.productName}`)
  //       .join(', ')

  //     const tableDisplay = tableGroup.tableName || 'Không xác định bàn'

  //     return `${tableDisplay} ${content} ${productMsgs}`
  //   })
  // }
}
