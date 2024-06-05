import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { CreateOrderByEmployeeDto } from './dto/create-order-by-employee.dto';
import { CommonService } from 'src/common/common.service';
import { calculatePagination, generateOrderCode } from 'utils/Helps';
import {
  CreateOrderByCustomerOnlineDto,
  CreateOrderByCustomerWithTableDto,
  ProductInOrder,
} from './dto/create-order-by-customer.dto';
import {
  CREATE_ORDER_BY_CUSTOMER_SELECT,
  CREATE_ORDER_BY_EMPLOYEE_SELECT,
} from 'enums/select.enum';
import { ORDER_STATUS_COMMON, ORDER_TYPE } from 'enums/order.enum';
import { approveOrderDto } from './dto/confirm-order.dto';
@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async createByEmployee(
    data: CreateOrderByEmployeeDto,
    tokenPayload: TokenPayload,
  ) {
    if (data.customerId)
      await this.commonService.findByIdWithShop(
        data.customerId,
        'Customer',
        tokenPayload.shopId,
      );

    const orderDetails = await this.getOrderDetails(
      data.products,
      tokenPayload.branchId,
    );

    const order = await this.prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          note: data.note,
          orderType: ORDER_TYPE.BY_EMPLOYEE,
          orderStatus: data.orderStatus || ORDER_STATUS_COMMON.APPROVED,
          code: data.code || generateOrderCode(),
          paymentMethod: data.paymentMethod,
          orderDetails: {
            createMany: {
              data: orderDetails,
            },
          },
          ...(data.tableId && {
            table: {
              connect: {
                id: data.tableId,
              },
            },
          }),
          ...(data.customerId && {
            customer: {
              connect: {
                id: data.customerId,
              },
            },
          }),
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

      // Thêm hóa đơn vào bàn
      if (data.isTable)
        await this.commonService.addOrderCurrentToTable(
          { orderId: newOrder.id, tableId: data.tableId },
          tokenPayload.branchId,
        );

      return newOrder;
    });

    return order;
  }

  async createByCustomerWithTable(data: CreateOrderByCustomerWithTableDto) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      data.branchId,
    );

    return this.prisma.order.create({
      data: {
        orderType: ORDER_TYPE.BY_CUSTOMER,
        orderStatus: ORDER_STATUS_COMMON.WAITING,
        note: data.note,
        code: generateOrderCode(),
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
        table: {
          connect: {
            id: data.tableId,
          },
        },
        branch: {
          connect: {
            id: data.branchId,
            isPublic: true,
          },
        },
      },
      select: CREATE_ORDER_BY_CUSTOMER_SELECT,
    });
  }

  async createByCustomerOnline(data: CreateOrderByCustomerOnlineDto) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      data.branchId,
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

  async getOrderDetails(products: ProductInOrder[], branchId: number) {
    return await Promise.all(
      products.map(async (product) => {
        const productExist = (await this.commonService.findByIdWithBranch(
          product.id,
          'Product',
          branchId,
        )) as Prisma.ProductCreateInput;

        const toppingExist = (await this.commonService.findByIdWithBranch(
          product.toppingId,
          'Product',
          branchId,
        )) as Prisma.ToppingCreateInput;

        return {
          ...(product.toppingId && {
            toppingId: product.toppingId,
          }),
          productPrice: productExist.price,
          toppingPrice: toppingExist.price,
          productId: product.id,
          amount: product.amount,
          branchId,
        } as Prisma.OrderDetailCreateManyInput;
      }),
    );
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword, customerId, from, to, orderTypes, isPaid } =
      params;

    const keySearch = ['code'];

    let where: Prisma.OrderWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      ...(customerId && {
        customerId: customerId,
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: to,
          },
        }),
      ...(from &&
        !to && {
          createdAt: {
            gte: from,
          },
        }),
      ...(!from &&
        to && {
          createdAt: {
            lte: to,
          },
        }),
      ...(orderTypes?.length > 0 && {
        orderType: { in: orderTypes },
      }),
      ...(isPaid && {
        isPaid,
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          code: true,
          table: {
            select: {
              id: true,
              name: true,
              code: true,
              photoURL: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              code: true,
              phone: true,
              address: true,
              email: true,
            },
          },
          isPaid: true,
          note: true,
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
              topping: {
                select: {
                  id: true,
                  name: true,
                  photoURLs: true,
                },
              },
            },
          },
          createdAt: true,
        },
      }),
      this.prisma.order.count({
        where,
      }),
    ]);
    return {
      list: data,

      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async approveOrder(
    where: Prisma.OrderWhereUniqueInput,
    data: approveOrderDto,
    tokenPayload: TokenPayload,
  ) {
    await this.commonService.addOrderCurrentToTable(
      {
        orderId: where.id,
        tableId: data.tableId,
      },
      tokenPayload.branchId,
    );

    return this.prisma.order.update({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
      data: {
        orderStatus: ORDER_STATUS_COMMON.APPROVED,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async createProductsToOrderByCustomer(
    where: Prisma.OrderWhereUniqueInput,
    data: Prisma.OrderDetailCreateInput,
  ) {}

  async createProductsToOrderByEmployee(
    where: Prisma.OrderWhereUniqueInput,
    data: Prisma.OrderDetailCreateInput,
  ) {}

  async update(
    where: Prisma.OrderWhereUniqueInput,
    data: Prisma.OrderUpdateInput,
    tokenPayload: TokenPayload,
  ) {}

  async findUniq(
    where: Prisma.ProductWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {}

  async removeMany(
    where: Prisma.ProductWhereInput,
    tokenPayload: TokenPayload,
  ) {}
}
