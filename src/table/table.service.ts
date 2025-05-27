import {
  ActivityAction,
  NotifyType,
  OrderDetailStatus,
  OrderStatus,
  OrderType,
  PaymentMethodType,
  Prisma,
  PrismaClient
} from '@prisma/client'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  addDishDto,
  AddDishesByCustomerDto,
  AddDishesDto,
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
  getOrderDetailsInTable,
  getOrderTotal,
  getVoucher,
  removeDiacritics
} from 'utils/Helps'

import { tableSelect } from 'responses/table.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { orderSelect } from 'responses/order.response'
import { PaymentFromTableDto, PaymentWithVNPayDto } from 'src/order/dto/payment.dto'
import { IOrderDetail } from 'interfaces/orderDetail.interface'
import { orderDetailSelect } from 'responses/order-detail.response'
import { SeparateTableDto } from 'src/order/dto/order.dto'
import { NotifyService } from 'src/notify/notify.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { TableGatewayHandler } from 'src/gateway/handlers/table.handler'
import { OrderGatewayHandler } from 'src/gateway/handlers/order-gateway.handler'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'
import { productShortSelect } from 'responses/product.response'
import { productOptionSelect } from 'responses/product-option-group.response'
import { VnpayService } from 'src/vnpay/vnpay.service'

@Injectable()
export class TableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly activityLogService: ActivityLogService,
    private readonly notifyService: NotifyService,
    private readonly tableGatewayHandler: TableGatewayHandler,
    private readonly orderGatewayHandler: OrderGatewayHandler,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler,
    private readonly vnpayService: VnpayService
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
    const result = await this.prisma.$transaction(async (prisma: PrismaClient) => {
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
        prisma.table.deleteMany({
          where: {
            id: { in: data.ids },
            branchId
          }
        })
      ])

      return entities
    })

    await Promise.all([
      this.activityLogService.create(
        {
          action: ActivityAction.DELETE,
          modelName: 'Table',
          targetName: result.map(item => item.name).join(', ')
        },
        { branchId },
        accountId
      )
    ])

    return result
  }

  async addDishes(
    tableId: string,
    data: AddDishesDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    const result = await this.prisma.$transaction(async prisma => {
      const upsertTasks = data.orderProducts.map(async item => {
        const [product, productOptions] = await Promise.all([
          this.prisma.product.findUniqueOrThrow({
            where: { id: item.productId },
            select: productShortSelect
          }),
          this.prisma.productOption.findMany({
            where: { id: { in: item.productOptionIds || [] } },
            select: productOptionSelect
          })
        ])

        return prisma.orderDetail.create({
          data: {
            amount: item.amount,
            tableId,
            status: OrderDetailStatus.APPROVED,
            createdBy: accountId,
            note: item.note,
            productOriginId: item.productId,
            product,
            productOptions: productOptions,
            branchId
          },
          select: orderDetailSelect
        })
      })

      return await Promise.all(upsertTasks)
    })

    await this.orderDetailGatewayHandler.handleCreateOrderDetails(result, branchId, deviceId)

    return result
  }

  async addDishesByCustomer(id: string, data: AddDishesByCustomerDto) {
    console.log(id, data)
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
        const orderDetailsInTable = await getOrderDetailsInTable(tableId, prisma)
        const orderTotalNotDiscount = getOrderTotal(orderDetailsInTable)
        const paymentMethod = await prisma.paymentMethod.findUniqueOrThrow({
          where: {
            id: data.paymentMethodId
          }
        })

        if (paymentMethod.type === PaymentMethodType.VNPAY) {
          throw new HttpException('Không thể chọn phương thức này!', HttpStatus.CONFLICT)
        }

        const voucherParams = {
          voucherId: data.voucherId,
          branchId,
          orderDetails: orderDetailsInTable,
          voucherCheckRequest: {
            orderTotal: orderTotalNotDiscount,
            totalPeople: data.totalPeople
          }
        }

        // Lấy thông tin giảm giá
        const [voucher, discountCodeValue, customerDiscountValue] = await Promise.all([
          getVoucher(voucherParams, prisma),
          getDiscountCode(data.discountCode, orderTotalNotDiscount, branchId, prisma),
          getCustomerDiscount(data.customerId, orderTotalNotDiscount, prisma)
        ])

        const orderTotal =
          orderTotalNotDiscount -
          (voucher.voucherValue || 0) -
          discountCodeValue -
          customerDiscountValue

        // Thanh toán với tiền mặt | chuyển khoản
        if (
          paymentMethod.type === PaymentMethodType.CASH ||
          paymentMethod.type === PaymentMethodType.BANKING
        ) {
          if (orderTotal > data.moneyReceived)
            throw new HttpException('Tiền nhận không hợp lệ!', HttpStatus.CONFLICT)

          const createOrderPromise = prisma.order.create({
            data: {
              isPaid: true,
              tableId,
              orderTotal,
              code: data.code || generateCode('DH', 15),
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
            select: orderSelect
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
          await Promise.all([
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
        }
      },
      {
        timeout: 10_000,
        maxWait: 15_000
      }
    )
  }

  async paymentWithVNPay(
    tableId: string,
    data: PaymentWithVNPayDto,
    ipAddr: string,
    accountId: string,
    branchId: string
  ) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const orderDetailsInTable = await getOrderDetailsInTable(tableId, prisma)
      const orderTotalNotDiscount = getOrderTotal(orderDetailsInTable)

      const paymentMethod = await prisma.paymentMethod.findUniqueOrThrow({
        where: {
          type_branchId: {
            branchId,
            type: 'VNPAY'
          }
        }
      })

      const voucherParams = {
        voucherId: data.voucherId,
        branchId,
        orderDetails: orderDetailsInTable,
        voucherCheckRequest: {
          orderTotal: orderTotalNotDiscount,
          totalPeople: data.totalPeople
        }
      }

      // Lấy thông tin giảm giá
      const [voucher, discountCodeValue, customerDiscountValue] = await Promise.all([
        getVoucher(voucherParams, prisma),
        getDiscountCode(data.discountCode, orderTotalNotDiscount, branchId, prisma),
        getCustomerDiscount(data.customerId, orderTotalNotDiscount, prisma)
      ])

      const orderTotal =
        orderTotalNotDiscount -
        (voucher.voucherValue || 0) -
        discountCodeValue -
        customerDiscountValue

      // Tạo đơn hàng NHÁP và chuyển các món từ bàn vào đơn
      const order = await prisma.order.create({
        data: {
          isPaid: false,
          isDraft: true,
          tableId,
          orderTotal,
          code: generateCode('DH', 15),
          note: data.note,
          type: OrderType.OFFLINE,
          status: data.status || OrderStatus.SUCCESS,
          discountCodeValue,
          voucherValue: voucher.voucherValue,
          voucherProducts: voucher.voucherProducts,
          customerDiscountValue,
          paymentMethodId: paymentMethod.id,
          createdBy: accountId,
          branchId,
          ...(data.customerId && { customerId: data.customerId })
        },
        select: orderSelect
      })

      await prisma.orderDetail.updateMany({
        data: {
          updatedBy: accountId,
          orderId: order.id
        },
        where: {
          tableId
        }
      })

      // Tạo link sandbox vnpay
      const [newOrder, paymentURL] = await Promise.all([
        prisma.order.findUniqueOrThrow({ where: { id: order.id }, select: orderSelect }),
        this.vnpayService.createPaymentUrl(
          {
            amount: orderTotal,
            returnUrl: data.returnUrl,
            orderId: order.id,
            orderCode: order.code
          },
          ipAddr,
          branchId,
          prisma
        )
      ])

      return { newOrder, paymentURL }
    })
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

  async addDish(
    tableId: string,
    data: addDishDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    const [product, productOptions] = await Promise.all([
      this.prisma.product.findUniqueOrThrow({
        where: { id: data.productId },
        select: productShortSelect
      }),
      this.prisma.productOption.findMany({
        where: { id: { in: data.productOptionIds || [] } },
        select: productOptionSelect
      })
    ])

    const newOrderDetail = await this.prisma.orderDetail.create({
      data: {
        amount: 1,
        tableId: tableId,
        productOriginId: data.productId,
        product,
        productOptions,
        note: data.note,
        status: OrderDetailStatus.APPROVED,
        createdBy: accountId,
        branchId
      },
      select: orderDetailSelect
    })

    await this.orderDetailGatewayHandler.handleUpdateOrderDetails(
      newOrderDetail,
      branchId,
      deviceId
    )

    return newOrderDetail
  }
}
