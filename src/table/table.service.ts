import {
  ActivityAction,
  NotifyType,
  OrderDetailStatus,
  OrderStatus,
  OrderType,
  Prisma,
  PrismaClient
} from '@prisma/client'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  AddDishByCustomerDto,
  AddDishDto,
  CreateTableDto,
  FindManyTableDto,
  UpdateTableDto
} from './dto/table.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import {
  customPaginate,
  generateCode,
  getCustomerDiscount,
  getDiscountCode,
  getNotifyInfo,
  getOrderDetails,
  getOrderTotal,
  getVoucher,
  removeDiacritics
} from 'utils/Helps'

import { tableSelect } from 'responses/table.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { orderSortSelect } from 'responses/order.response'
import { PaymentFromTableDto } from 'src/order/dto/payment.dto'
import { IOrderDetail } from 'interfaces/orderDetail.interface'
import { orderDetailSortSelect } from 'responses/order-detail.response'
import { SeparateTableDto } from 'src/order/dto/order.dto'
import { NotifyService } from 'src/notify/notify.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'

@Injectable()
export class TableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService,
    private readonly notifyService: NotifyService,
    private readonly tableGatewayHandler: TableGatewayHandler,
    private readonly orderGatewayHandler: OrderGatewayHandler
  ) {}

  async create(data: CreateTableDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const table = await prisma.table.create({
        data: {
          name: data.name,
          seat: data.seat,
          areaId: data.areaId,
          branchId,
          createdBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.CREATE,
          modelName: 'Table',
          targetName: table.name,
          targetId: table.id
        },
        { branchId },
        accountId
      )

      return table
    })
  }

  async findAll(params: FindManyTableDto, branchId: string) {
    const { page, perPage, keyword, areaIds, orderBy } = params

    const keySearch = ['name']

    const where: Prisma.TableWhereInput = {
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      ...(areaIds?.length && {
        area: {
          id: { in: areaIds }
        }
      }),
      branchId
    }

    return await customPaginate(
      this.prisma.table,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: tableSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(where: Prisma.TableWhereUniqueInput) {
    return this.prisma.table.findUniqueOrThrow({
      where: {
        ...where
      },
      select: tableSelect
    })
  }

  async update(id: string, data: UpdateTableDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const table = await prisma.table.update({
        where: {
          id,
          branchId
        },
        data: {
          name: data.name,
          seat: data.seat,
          areaId: data.areaId,
          updatedBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'Table',
          targetId: table.id,
          targetName: table.name
        },
        { branchId },
        accountId
      )

      return table
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const entities = await prisma.table.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        entities,
        accountId,
        modelName: 'Table'
      }

      await Promise.all([
        this.trashService.createMany(dataTrash, prisma),
        this.activityLogService.create(
          {
            action: ActivityAction.DELETE,
            modelName: 'Table',
            targetName: entities.map(item => item.name).join(', ')
          },
          { branchId },
          accountId
        )
      ])

      return prisma.table.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
  }

  async addDish(
    tableId: string,
    data: AddDishDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.prisma.$transaction(async prisma => {
      const orderDetails = await getOrderDetails(
        data.orderProducts,
        OrderDetailStatus.PROCESSING,
        accountId,
        branchId
      )

      const table = await prisma.table.update({
        where: { id: tableId },
        data: {
          orderDetails: {
            createMany: {
              data: orderDetails
            }
          }
        },
        select: tableSelect
      })

      const notify = getNotifyInfo(data.orderProducts[0].status)

      // Bắn socket
      await Promise.all([
        this.tableGatewayHandler.handleAddDish(table, branchId, deviceId),
        this.notifyService.create(
          {
            type: notify.type,
            content: `${table.name} - ${table.area.name} có món ${notify.content}`
          },
          branchId,
          deviceId
        )
      ])

      return table
    })
  }

  async addDishByCustomer(id: string, data: AddDishByCustomerDto) {
    const orderDetails = await getOrderDetails(
      data.orderProducts,
      OrderDetailStatus.APPROVED,
      null,
      data.branchId
    )

    const table = await this.prisma.table.update({
      where: { id },
      data: {
        orderDetails: {
          createMany: {
            data: orderDetails
          }
        }
      },
      select: tableSelect
    })

    const notify = getNotifyInfo(data.orderProducts[0].status)

    // Bắn socket
    Promise.all([
      this.tableGatewayHandler.handleAddDish(table, data.branchId),
      this.notifyService.create(
        {
          type: notify.type,
          content: `${table.name} - ${table.area.name} có món ${notify.content}`
        },
        data.branchId
      )
    ])

    return table
  }

  async payment(
    tableId: string,
    data: PaymentFromTableDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return await this.prisma.$transaction(
      async (prisma: PrismaClient) => {
        const orderDetailsInTable = await this.getOrderDetailsInTable(tableId, prisma)
        const orderTotal = getOrderTotal(orderDetailsInTable)

        const voucherParams = {
          voucherId: data.voucherId,
          branchId,
          orderDetails: orderDetailsInTable,
          voucherCheckRequest: {
            orderTotal,
            totalPeople: data.totalPeople
          }
        }

        // Lấy thông tin giảm giá
        const [voucher, discountCodeValue, customerDiscountValue] = await Promise.all([
          getVoucher(voucherParams, prisma),
          getDiscountCode(data.discountCode, orderTotal, branchId, prisma),
          getCustomerDiscount(data.customerId, orderTotal, prisma)
        ])

        // Tạo order
        const createOrderPromise = prisma.order.create({
          data: {
            isPaid: true,
            tableId,
            code: data.code || generateCode('DH'),
            note: data.note,
            type: OrderType.OFFLINE,
            status: data.status || OrderStatus.SUCCESS,
            discountCodeValue,
            voucherValue: voucher.voucherValue,
            voucherProducts: voucher.voucherProducts,
            customerDiscountValue,
            bankingImages: data.bankingImages,
            moneyReceived: data.moneyReceived,
            paymentAt: new Date(),
            paymentMethodId: data.paymentMethodId,
            createdBy: accountId,
            branchId,
            ...(data.customerId && { customerId: data.customerId })
          },
          select: orderSortSelect
        })

        // Gán chi tiết đơn hàng
        const passOrderDetailPromise = createOrderPromise.then(order => {
          return this.passOrderDetailToOrder(orderDetailsInTable, order.id, accountId, prisma)
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [newOrder, _] = await Promise.all([createOrderPromise, passOrderDetailPromise])

        // Đơn hàng chi tiết (món mới chuyển từ bàn)
        const fullOrder = { ...newOrder, orderDetails: orderDetailsInTable }

        // Gửi socket, lưu log
        Promise.all([
          this.activityLogService.create(
            {
              action: ActivityAction.PAYMENT,
              modelName: 'Order',
              targetName: fullOrder.code,
              targetId: fullOrder.id
            },
            { branchId },
            accountId
          ),
          this.orderGatewayHandler.handleCreateOrder(fullOrder, branchId, deviceId),
          this.tableGatewayHandler.handleUpdateTable(fullOrder.table, branchId, deviceId)
        ])

        return fullOrder
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )
  }

  async passOrderDetailToOrder(
    orderDetails: IOrderDetail[],
    orderId: string,
    accountId: string,
    prisma: PrismaClient
  ) {
    const orderDetailIds = orderDetails?.map(orderDetail => orderDetail.id)

    return prisma.orderDetail.updateMany({
      data: {
        tableId: null,
        updatedBy: accountId,
        orderId: orderId
      },
      where: {
        id: {
          in: orderDetailIds
        }
      }
    })
  }

  async getOrderDetailsInTable(tableId: string, prisma: PrismaClient): Promise<any[]> {
    const orderDetails = await prisma.orderDetail.findMany({
      where: { tableId },
      select: orderDetailSortSelect
    })

    if (!orderDetails.length) throw new HttpException('Không tìm thấy món!', HttpStatus.NOT_FOUND)

    return orderDetails
  }

  async separateTable(id: string, data: SeparateTableDto, accountId: string, branchId: string) {
    const { toTableId, orderDetails } = data

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      // Kiểm tra bàn nguồn và bàn đích
      const [fromTable, toTable] = await Promise.all([
        prisma.table.findUnique({ where: { id } }),
        prisma.table.findUnique({ where: { id: toTableId } })
      ])

      if (!fromTable || !toTable) {
        throw new HttpException('Không tìm thấy bàn nguồn hoặc bàn đích!', HttpStatus.NOT_FOUND)
      }

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

      // Ghi log hoạt động
      Promise.all([
        this.tableGatewayHandler.handleUpdateTable(tableUpdates, branchId),
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

      return tableUpdates
    })
  }

  async requestPayment(id: string, branchId: string) {
    const table = await this.prisma.table.findUniqueOrThrow({
      where: { id, branchId },
      include: { area: true }
    })

    return this.notifyService.create(
      {
        type: NotifyType.PAYMENT_REQUEST,
        content: `${table.name} - ${table.area.name} yêu cầu thanh toán`
      },
      branchId
    )
  }

  // async reportToKitchen(tableId: string, tokenPayload: TokenPayload) {
  //   return await this.prisma.$transaction(async prisma => {
  //     const table = await prisma.table.findFirstOrThrow({
  //       where: {
  //         id: tableId
  //       },
  //       include: { area: true }
  //     })

  //     const orderDetails = await prisma.orderDetail.findMany({
  //       where: {
  //         tableId
  //       }
  //     })

  //     await prisma.orderDetail.updateMany({
  //       where: {
  //         tableId
  //       },
  //       data: {
  //         status: OrderDetailStatus.PROCESSING,
  //         updatedBy: tokenPayload.accountId
  //       }
  //     })

  //     const updatedOrderDetails = orderDetails.map(detail => ({
  //       ...detail,
  //       status: OrderDetailStatus.PROCESSING
  //     }))

  //     await Promise.all([
  //       this.orderDetailGateway.handleModifyOrderDetails(
  //         updatedOrderDetails,
  //         tokenPayload.branchId
  //       ),
  //       this.notifyService.create(
  //         {
  //           branchId: tokenPayload.branchId,
  //           type: NotifyType.REPORT_TO_KITCHEN,
  //           content: `${table.name} - ${table.area.name}`
  //         },
  //         tokenPayload.deviceId
  //       )
  //     ])

  //     return updatedOrderDetails
  //   })
  // }
}
