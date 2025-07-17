import { OrderDetailStatus, PrismaClient } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { AddDishesDto, addDishDto } from '../dto/table.dto'
import { orderDetailSelect } from 'responses/order-detail.response'
import { OrderDetailGatewayHandler } from 'src/gateway/handlers/order-detail-gateway.handler'
import { productSelect } from 'responses/product.response'
import { productOptionSelect } from 'responses/product-option-group.response'
import { IOrderDetail } from 'interfaces/orderDetail.interface'

@Injectable()
export class TableOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderDetailGatewayHandler: OrderDetailGatewayHandler
  ) {}

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
            select: productSelect
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

  async addDish(
    tableId: string,
    data: addDishDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: data.productId },
      select: productSelect
    })

    const newOrderDetail = await this.prisma.orderDetail.create({
      data: {
        amount: 1,
        tableId: tableId,
        productOriginId: data.productId,
        product,
        note: data.note,
        status: OrderDetailStatus.APPROVED,
        createdBy: accountId,
        branchId
      },
      select: orderDetailSelect
    })

    await this.orderDetailGatewayHandler.handleCreateOrderDetails(
      newOrderDetail,
      branchId,
      deviceId
    )

    return newOrderDetail
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
}
