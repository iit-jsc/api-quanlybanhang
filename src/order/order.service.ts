import { Injectable } from '@nestjs/common';
import { CreateOrderDto, ProductInOrder } from './dto/create-order.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { CreateOrderOnlineDto } from './dto/create-order-online.dto';
import { CreateOrderToTableDto } from './dto/create-order-to-table.dto';
import { Prisma } from '@prisma/client';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaymentFromTableDto } from './dto/payment-order-from-table.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { CombineTableDto } from './dto/combine-table.dto';
import { SwitchTableDto } from './dto/switch-table.dto';
import { FindManyDto } from 'utils/Common.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { SeparateTableDto } from './dto/separate-table.dto';
import { CreateOrderToTableByCustomerDto } from './dto/create-order-to-table-by-customer.dto';
import { PrismaService } from 'nestjs-prisma';
import { CommonService } from 'src/common/common.service';
import {
  DETAIL_ORDER_STATUS,
  ORDER_STATUS_COMMON,
  ORDER_TYPE,
} from 'enums/order.enum';
import { generateOrderCode } from 'utils/Helps';
import { CREATE_ORDER_BY_EMPLOYEE_SELECT } from 'enums/select.enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async getOrderDetails(
    products: ProductInOrder[],
    branchId: number,
    status?: number,
  ) {
    return await Promise.all(
      products.map(async (product) => {
        let toppingExist = {} as Prisma.ToppingCreateInput;
        const productExist = (await this.commonService.findByIdWithBranch(
          product.id,
          'Product',
          branchId,
        )) as Prisma.ProductCreateInput;

        if (product.toppingId)
          toppingExist = (await this.commonService.findByIdWithBranch(
            product.toppingId,
            'Product',
            branchId,
          )) as Prisma.ToppingCreateInput;

        return {
          ...(product.toppingId && {
            toppingId: product.toppingId,
            toppingPrice: toppingExist.price,
          }),
          productPrice: productExist.price,
          productId: product.id,
          amount: product.amount,
          status,
          branchId,
        } as Prisma.OrderDetailCreateManyInput;
      }),
    );
  }

  async create(data: CreateOrderDto, tokenPayload: TokenPayload) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      tokenPayload.branchId,
      DETAIL_ORDER_STATUS.DONE,
    );

    return await this.prisma.order.create({
      data: {
        note: data.note,
        orderType: ORDER_TYPE.BY_EMPLOYEE,
        orderStatus: data.orderStatus || ORDER_STATUS_COMMON.APPROVED,
        code: data.code || generateOrderCode(),
        paymentMethod: data.paymentMethod,
        ...(data.customerId && {
          customer: {
            connect: {
              id: data.customerId,
            },
          },
        }),
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
        branch: {
          connect: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
        createdByAccount: {
          connect: {
            id: tokenPayload.accountId,
            isPublic: true,
          },
        },
        updatedByAccount: {
          connect: {
            id: tokenPayload.accountId,
            isPublic: true,
          },
        },
      },
      select: CREATE_ORDER_BY_EMPLOYEE_SELECT,
    });
  }

  async createOrderToTableByEmployee(
    data: CreateOrderToTableDto,
    tokenPayload: TokenPayload,
  ) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      tokenPayload.branchId,
      DETAIL_ORDER_STATUS.APPROVED,
    );

    return await this.prisma.table.update({
      where: { id: data.tableId },
      data: {
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
      },
      include: {
        orderDetails: true,
      },
    });
  }

  async createOrderToTableByCustomer(data: CreateOrderToTableByCustomerDto) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      data.branchId,
      DETAIL_ORDER_STATUS.WAITING,
    );

    return await this.prisma.table.update({
      where: { id: data.tableId },
      data: {
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
      },
      include: {
        orderDetails: true,
      },
    });
  }

  async createOrderOnline(data: CreateOrderOnlineDto) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      data.branchId,
      DETAIL_ORDER_STATUS.WAITING,
    );

    const customer = await this.commonService.findOrCreateCustomer(
      {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
      },
      { phone: data.phone, branchId: data.branchId },
    );

    return this.prisma.order.create({
      data: {
        note: data.note,
        customer: {
          connect: {
            id: customer.id,
          },
        },
        orderType: ORDER_TYPE.BY_CUSTOMER,
        orderStatus: ORDER_STATUS_COMMON.WAITING,
        code: generateOrderCode(),
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
        branch: {
          connect: {
            id: data.branchId,
            isPublic: true,
          },
        },
      },
      select: {
        id: true,
        note: true,
        orderStatus: true,
        customer: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        orderDetails: {
          select: {
            id: true,
            amount: true,
            note: true,
            productPrice: true,
            toppingPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async updateOrderDetail(
    params: {
      where: Prisma.OrderDetailWhereUniqueInput;
      data: UpdateOrderDetailDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return await this.prisma.orderDetail.update({
      where: {
        id: where.id,
        branch: {
          isPublic: true,
          id: tokenPayload.branchId,
        },
      },
      data: {
        productId: data.productId,
        toppingId: data.toppingId,
        amount: data.amount,
        note: data.note,
        status: data.status,
      },
    });
  }

  async paymentFromTable(
    data: PaymentFromTableDto,
    tokenPayload: TokenPayload,
  ) {}

  async update(
    params: {
      where: Prisma.OrderWhereUniqueInput;
      data: UpdateOrderDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    await this.prisma.order.update({
      where: {
        id: where.id,
        branch: {
          id: tokenPayload.branchId,
          isPublic: true,
        },
      },
      data: {
        orderStatus: data.orderStatus,
        note: data.note,
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid,
        updatedByAccount: {
          connect: {
            id: tokenPayload.accountId,
            isPublic: true,
          },
        },
      },
    });
  }

  async combineTable(data: CombineTableDto, tokenPayload: TokenPayload) {}

  async separateTable(data: SeparateTableDto, tokenPayload: TokenPayload) {}

  async switchTable(data: SwitchTableDto, tokenPayload: TokenPayload) {}

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {}

  async findUniq(
    where: Prisma.OrderWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {}

  async removeMany(where: Prisma.OrderWhereInput, tokenPayload: TokenPayload) {}

  async cancelOrder(
    cancelOrderDto: CancelOrderDto,
    tokenPayload: TokenPayload,
  ) {}
}
