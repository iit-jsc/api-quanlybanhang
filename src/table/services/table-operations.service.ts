import { ActivityAction, NotifyType, PrismaClient } from '@prisma/client'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { SeparateTableDto } from 'src/order/dto/order.dto'
import { tableSelect } from 'responses/table.response'
import { NotifyService } from 'src/notify/notify.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'

@Injectable()
export class TableOperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifyService: NotifyService,
    private readonly activityLogService: ActivityLogService,
    private readonly tableGatewayHandler: TableGatewayHandler
  ) {}

  async separateTable(id: string, data: SeparateTableDto, accountId: string, branchId: string) {
    const { toTableId, orderDetails } = data

    const [fromTable, toTable] = await Promise.all([
      this.prisma.table.findUnique({ where: { id } }),
      this.prisma.table.findUnique({ where: { id: toTableId } })
    ])

    // Kiểm tra bàn nguồn và bàn đích
    if (!fromTable || !toTable) {
      throw new HttpException('Không tìm thấy bàn nguồn hoặc bàn đích!', HttpStatus.NOT_FOUND)
    }

    const result = await this.prisma.$transaction(async (prisma: PrismaClient) => {
      // Cập nhật hoặc tạo mới orderDetail dựa trên amount
      const updatePromises = orderDetails.map(async ({ id: orderDetailId, amount }) => {
        const orderDetail = await prisma.orderDetail.findUnique({
          where: { id: orderDetailId }
        })

        if (!orderDetail) {
          throw new HttpException(
            `Không tìm thấy chi tiết đơn hàng với ID ${orderDetailId}!`,
            HttpStatus.NOT_FOUND
          )
        }

        if (amount > orderDetail.amount) {
          throw new HttpException(
            `Số lượng yêu cầu (${amount}) vượt quá số lượng hiện có (${orderDetail.amount})`,
            HttpStatus.CONFLICT
          )
        }

        if (amount === orderDetail.amount) {
          // Nếu số lượng bằng nhau, chỉ cập nhật tableId
          return prisma.orderDetail.update({
            where: { id: orderDetailId },
            data: {
              tableId: toTableId,
              updatedBy: accountId,
              branchId
            }
          })
        } else {
          // Giảm số lượng ở bản ghi hiện tại
          await prisma.orderDetail.update({
            where: { id: orderDetailId },
            data: {
              amount: orderDetail.amount - amount,
              updatedBy: accountId
            }
          })

          // Tạo bản ghi mới cho bàn đích
          return prisma.orderDetail.create({
            data: {
              ...orderDetail,
              id: undefined,
              tableId: toTableId,
              amount,
              createdBy: accountId,
              branchId
            }
          })
        }
      })

      await Promise.all(updatePromises)

      // Trả về thông tin cả hai bàn
      const tableUpdates = await prisma.table.findMany({
        where: { id: { in: [toTableId, id] } },
        select: tableSelect
      })

      return tableUpdates
    })

    // Ghi log hoạt động
    await Promise.all([
      this.tableGatewayHandler.handleUpdateTable(result, branchId),
      this.activityLogService.create(
        {
          action: ActivityAction.SEPARATE_TABLE,
          modelName: 'Table',
          targetId: toTable.id,
          targetName: toTable.name,
          relatedName: fromTable.name
        },
        { branchId },
        accountId
      )
    ])

    return result
  }

  async requestPayment(id: string, branchId: string, deviceId: string) {
    const table = await this.prisma.table.findUniqueOrThrow({
      where: { id, branchId },
      include: { area: true }
    })

    return this.notifyService.create(
      {
        type: NotifyType.PAYMENT_REQUEST,
        content: `${table.name} - ${table.area.name} yêu cầu thanh toán`,
        modelName: 'Table',
        targetId: table.id,
        createdAt: new Date()
      },
      branchId,
      deviceId
    )
  }
}
