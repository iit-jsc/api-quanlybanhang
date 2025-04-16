import { PrismaService } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
  CancelOrderDetailsDto,
  FindManyOrderDetailDto,
  UpdateOrderDetailDto,
  UpdateStatusOrderDetailsDto
} from './dto/order-detail.dto'
import { ActivityAction, OrderDetailStatus, Prisma, PrismaClient } from '@prisma/client'
import { customPaginate, getNotifyInfo } from 'utils/Helps'
import { orderDetailSelect } from 'responses/order-detail.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { OrderDetailGateway } from 'src/gateway/order-detail.gateway'
import { NotifyService } from 'src/notify/notify.service'
import { IProductGroup, ITableGroup } from 'interfaces/orderDetail.interface'

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
        updatedBy: accountId
      },
      select: orderDetailSelect
    })

    await this.orderDetailGateway.handleModifyOrderDetail(orderDetail, branchId)

    return orderDetail
  }

  async cancel(id: string, data: CancelOrderDetailsDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const orderDetail = await prisma.orderDetail.findFirstOrThrow({
        where: { id, branchId },
        select: { amount: true }
      })

      // Kiểm tra số lượng hủy
      if (data.amount > orderDetail.amount) {
        throw new HttpException(
          `Số lượng hủy (${data.amount}) không được lớn hơn số lượng hiện tại (${orderDetail.amount})`,
          HttpStatus.CONFLICT
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

      this.orderDetailGateway.handleModifyOrderDetails([newOrderDetail], branchId)

      return newOrderDetail
    })
  }

  async updateStatusOrderDetails(
    data: UpdateStatusOrderDetailsDto,
    accountId: string,
    branchId: string
  ) {
    return this.prisma.$transaction(async prisma => {
      // Fetch all current details in one query to reduce database round-trips
      const currentDetails = await prisma.orderDetail.findMany({
        where: {
          id: { in: data.orderDetails.map(detail => detail.id) },
          branchId
        }
      })

      // Create a map for faster lookup
      const detailsMap = new Map(currentDetails.map(detail => [detail.id, detail]))

      const updatePromises = data.orderDetails.map(async detail => {
        const currentDetail = detailsMap.get(detail.id)

        if (!currentDetail)
          throw new HttpException('Không tìm thấy chi tiết món!', HttpStatus.NOT_FOUND)

        const baseUpdateData = {
          status: data.status,
          updatedBy: accountId,
          amount: detail.amount,
          updatedAt: new Date()
        }

        if (detail.amount !== currentDetail.amount) {
          const newDetail = await prisma.orderDetail.create({
            data: {
              ...currentDetail,
              id: undefined,
              amount: detail.amount,
              status: data.status,
              updatedBy: accountId,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            select: orderDetailSelect
          })

          await prisma.orderDetail.update({
            where: { id: detail.id, branchId },
            data: {
              amount: { decrement: detail.amount },
              updatedBy: accountId,
              updatedAt: new Date()
            },
            select: { id: true }
          })

          return newDetail
        }

        return prisma.orderDetail.update({
          where: { id: detail.id, branchId },
          data: baseUpdateData,
          select: orderDetailSelect
        })
      })

      const results = await Promise.all(updatePromises)

      // Batch notification creation
      const notify = getNotifyInfo(data.status)
      const messages = this.getMessagesToNotify(results, notify.content)

      // Chuyển messages thành mảng CreateNotifyDto
      const notifyDtos = messages.map(content => ({
        branchId,
        modelName: 'Order',
        type: notify.type,
        content
      }))

      setImmediate(async () => {
        await Promise.all([
          this.notifyService.createMany(notifyDtos).catch(error => {
            console.error('Failed to send notifications:', error)
            // Optionally emit to a monitoring service
          }),
          this.orderDetailGateway.handleModifyOrderDetails(results, branchId).catch(error => {
            console.error('Failed to handle modify order details:', error)
          })
        ])
      })

      return results
    })
  }

  getActivityActionByStatus(status: OrderDetailStatus) {
    if (status === OrderDetailStatus.APPROVED) {
      return ActivityAction.APPROVE_DISH
    }

    if (status === OrderDetailStatus.PROCESSING) {
      return ActivityAction.REPORT_TO_KITCHEN
    }

    if (status === OrderDetailStatus.TRANSPORTING) {
      return ActivityAction.TRANSPORT_DISH
    }

    if (status === OrderDetailStatus.SUCCESS) {
      return ActivityAction.SUCCESS_DISH
    }
  }

  getMessagesToNotify(orderDetails: any, content: string): string[] {
    const groupedByTable = orderDetails.reduce((acc: Record<string, ITableGroup>, detail) => {
      const tableId = detail.table?.id ?? detail.tableId ?? 'unknown'
      const productId = detail.product?.id ?? detail.productOriginId ?? 'unknown'
      const tableName = detail.table?.name ?? 'Unknown Table'
      const areaName = detail.table?.area?.name ?? 'Unknown Area'
      const productName = detail.product?.name
      const amount = detail.amount
      const status = detail.status

      // Initialize table group
      if (!acc[tableId]) {
        acc[tableId] = {
          tableId,
          tableName,
          areaName,
          products: {}
        }
      }

      // Initialize product group
      if (!acc[tableId].products[productId]) {
        acc[tableId].products[productId] = {
          productId,
          productName,
          totalAmount: 0,
          status
        }
      }

      // Aggregate amount
      acc[tableId].products[productId].totalAmount += amount

      return acc
    }, {})

    // Step 2: Format output as list of strings
    const formattedOutput = Object.values(groupedByTable).flatMap((table: ITableGroup) => {
      return Object.values(table.products).map((product: IProductGroup) => {
        return `${table.tableName} - ${table.areaName} | ${product.totalAmount} - ${
          product.productName ?? 'Unknown Product'
        } ${content}`
      })
    })

    return formattedOutput
  }
}
