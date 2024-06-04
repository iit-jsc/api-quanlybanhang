import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { CreateOrderByEmployeeDto } from './dto/create-order-by-employee.dto';
import { CommonService } from 'src/common/common.service';
import { calculatePagination, generateOrderCode } from 'utils/Helps';
import { PRICE_TYPE } from 'enums/product.enum';
import {
  CreateOrderByCustomerOnlineDto,
  CreateOrderByCustomerWithTableDto,
  ProductInOrder,
} from './dto/create-order-by-customer.dto';
import { CustomHttpException } from 'utils/ApiErrors';
import {
  CREATE_ORDER_BY_CUSTOMER_SELECT,
  CREATE_ORDER_BY_EMPLOYEE_SELECT,
} from 'enums/select.enum';
import { ORDER_STATUS_COMMON, ORDER_TYPE } from 'enums/order.enum';
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
    if (data.isTable) {
      if (!data.tableId)
        throw new CustomHttpException(
          HttpStatus.NOT_FOUND,
          '#1 createByEmployee - ID bàn không được để trống!',
        );

      await this.commonService.findByIdWithBranch(
        data.tableId,
        'Table',
        tokenPayload.branchId,
      );
    }

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

    return this.prisma.order.create({
      data: {
        note: data.note,
        orderType: ORDER_TYPE.BY_EMPLOYEE,
        orderStatus: data.orderStatus || ORDER_STATUS_COMMON.WAITING,
        orderDate: new Date(),
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
  }

  async createByCustomerWithTable(data: CreateOrderByCustomerWithTableDto) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      data.branchId,
    );

    return this.prisma.order.create({
      data: {
        name: data.name,
        orderType: ORDER_TYPE.BY_CUSTOMER_WITH_TABLE,
        orderStatus: ORDER_STATUS_COMMON.WAITING,
        note: data.note,
        code: generateOrderCode(),
        orderDate: new Date(),
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

    return this.prisma.order.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        note: data.note,
        orderType: ORDER_TYPE.ONLINE,
        orderStatus: ORDER_STATUS_COMMON.WAITING,
        code: generateOrderCode(),
        orderDate: new Date(),
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
        name: true,
        phone: true,
        email: true,
        orderDate: true,
        address: true,
        note: true,
        orderStatus: true,
        orderDetails: {
          select: {
            id: true,
            amount: true,
            note: true,
            price: true,
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

        return {
          ...(product.toppingId && {
            toppingId: product.toppingId,
          }),
          price: productExist.price,
          productId: product.id,
          amount: product.amount,
          branchId,
        } as Prisma.OrderDetailCreateManyInput;
      }),
    );
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ['name'];

    let where: Prisma.OrderWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
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
          name: true,
          phone: true,
          email: true,
          orderDate: true,
          address: true,
          cancelReason: true,
          cancelDate: true,
          note: true,
          paymentMethod: true,
          createdBy: true,
          updatedBy: true,
          createdAt: true,
          updatedAt: true,
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

  async findUniq(
    where: Prisma.ProductWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {}

  async update(
    params: {
      where: Prisma.ProductWhereUniqueInput;
      data: CreateOrderByEmployeeDto;
    },
    tokenPayload: TokenPayload,
  ) {}

  async removeMany(
    where: Prisma.ProductWhereInput,
    tokenPayload: TokenPayload,
  ) {}
}
