import { NotifyType, OrderDetailStatus, OrderType, Prisma, PrismaClient } from '@prisma/client'
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
  getOrderDetails,
  getOrderTotal,
  getVoucher,
  handleOrderDetailsBeforePayment,
  removeDiacritics
} from 'utils/Helps'

import { tableSelect } from 'responses/table.response'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { TrashService } from 'src/trash/trash.service'
import { TableGateway } from 'src/gateway/table.gateway'
import { orderSortSelect } from 'responses/order.response'
import { PaymentFromTableDto } from 'src/order/dto/payment.dto'
import { IOrderDetail } from 'interfaces/orderDetail.interface'
import { IProduct } from 'interfaces/product.interface'
import { IProductOption } from 'interfaces/productOption.interface'
import { orderDetailSortSelect } from 'responses/order-detail.response'
import { SeparateTableDto } from 'src/order/dto/order.dto'
import { NotifyService } from 'src/notify/notify.service'

@Injectable()
export class TableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trashService: TrashService,
    private readonly tableGateway: TableGateway,
    private readonly notifyService: NotifyService
  ) {}

  async create(data: CreateTableDto, accountId: string, branchId: string) {
    return await this.prisma.table.create({
      data: {
        name: data.name,
        seat: data.seat,
        areaId: data.areaId,
        branchId,
        createdBy: accountId
      }
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
    return await this.prisma.table.update({
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
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'Table'
      }

      await this.trashService.createMany(dataTrash, prisma)

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

  async addDish(tableId: string, data: AddDishDto, accountId: string, branchId: string) {
    const orderDetails = await getOrderDetails(
      data.orderProducts,
      OrderDetailStatus.APPROVED,
      accountId,
      branchId
    )

    const table = await this.prisma.table.update({
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

    // Bắn socket và thông báo cho nhân viên trong chi nhánh
    setImmediate(() => {
      this.tableGateway.handleModifyTable(table)
      this.notifyService.create(
        {
          type: NotifyType.NEW_DISH_ADDED_TO_TABLE,
          branchId: branchId,
          tableId: table.id
        },
        accountId
      )
    })

    return table
  }

  async addDishByCustomer(id: string, data: AddDishByCustomerDto) {
    const orderDetails = await getOrderDetails(
      data.orderProducts,
      OrderDetailStatus.WAITING,
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

    setImmediate(() => {
      this.tableGateway.handleModifyTable(table)
      this.notifyService.create({
        type: NotifyType.NEW_DISH_ADDED_TO_TABLE,
        branchId: data.branchId,
        tableId: table.id
      })
    })

    return table
  }

  async payment(tableId: string, data: PaymentFromTableDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const orderDetails = await this.getOrderDetailsInTable(tableId, prisma)

      const orderTotal = getOrderTotal(orderDetails)

      const voucherParams = {
        voucherId: data.voucherId,
        branchId,
        orderDetails,
        voucherCheckRequest: {
          orderTotal,
          totalPeople: data.totalPeople
        }
      }

      const [voucher, discountCodeValue, customerDiscountValue] = await Promise.all([
        getVoucher(voucherParams, prisma),
        getDiscountCode(data.discountCode, orderTotal, branchId, prisma),
        getCustomerDiscount(data.customerId, orderTotal, prisma)
      ])

      const order = await prisma.order.create({
        data: {
          isPaid: true,
          tableId,
          code: data.code || generateCode('DH'),
          note: data.note,
          type: OrderType.OFFLINE,
          status: data.status,
          discountCodeValue: discountCodeValue,
          voucherValue: voucher.voucherValue,
          voucherProducts: voucher.voucherProducts,
          customerDiscountValue: customerDiscountValue,
          bankingImages: data.bankingImages,
          moneyReceived: data.moneyReceived,
          paymentAt: new Date(),
          paymentMethodId: data.paymentMethodId,
          createdBy: accountId,
          branchId,
          ...(data.customerId && {
            customerId: data.customerId
          })
        },
        select: orderSortSelect
      })

      await this.passOrderDetailToOrder(orderDetails, order.id, accountId, prisma)

      return prisma.order.findUnique({
        where: { id: order.id },
        select: orderSortSelect
      })
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

  async getOrderDetailsInTable(tableId: string, prisma: PrismaClient): Promise<IOrderDetail[]> {
    await handleOrderDetailsBeforePayment(prisma, { tableId })

    const orderDetails = await prisma.orderDetail.findMany({
      where: { tableId },
      select: orderDetailSortSelect
    })

    if (!orderDetails.length) throw new HttpException('Không tìm thấy món!', HttpStatus.NOT_FOUND)

    return orderDetails.map(orderDetail => ({
      id: orderDetail.id,
      branchId: orderDetail.branchId,
      amount: orderDetail.amount,
      orderId: orderDetail.orderId,
      note: orderDetail.note,
      product: orderDetail.product as unknown as IProduct,
      createdAt: orderDetail.createdAt,
      updatedAt: orderDetail.updatedAt,
      productOriginId: orderDetail.productOriginId,
      tableId: orderDetail.tableId,
      productOptions: orderDetail.productOptions as unknown as IProductOption[],
      productOrigin: orderDetail.productOrigin as IProduct
    }))
  }

  async separateTable(id: string, data: SeparateTableDto, accountId: string, branchId: string) {
    const { toTableId, orderDetailIds } = data

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      await prisma.orderDetail.updateMany({
        data: {
          tableId: toTableId,
          updatedBy: accountId,
          branchId
        },
        where: {
          id: {
            in: orderDetailIds
          },
          tableId: id
        }
      })

      return prisma.table.findFirstOrThrow({ where: { id: data.toTableId }, select: tableSelect })
    })
  }
}
