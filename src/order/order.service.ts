import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto, ProductInOrder } from './dto/create-order.dto';
import {
  TokenCustomerPayload,
  TokenPayload,
} from 'interfaces/common.interface';
import { CreateOrderOnlineDto } from './dto/create-order-online.dto';
import { CreateOrderToTableDto } from './dto/create-order-to-table.dto';
import { Prisma } from '@prisma/client';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaymentFromTableDto } from './dto/payment-order-from-table.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { CombineTableDto } from './dto/combine-table.dto';
import { FindManyDto, DeleteManyDto } from 'utils/Common.dto';
import { SeparateTableDto } from './dto/separate-table.dto';
import { CreateOrderToTableByCustomerDto } from './dto/create-order-to-table-by-customer.dto';
import { PrismaService } from 'nestjs-prisma';
import { CommonService } from 'src/common/common.service';
import {
  DETAIL_ORDER_STATUS,
  ORDER_STATUS_COMMON,
  ORDER_TYPE,
  TRANSACTION_TYPE,
} from 'enums/order.enum';
import { calculatePagination, generateOrderCode } from 'utils/Helps';
import { CustomHttpException } from 'utils/ApiErrors';
import { SaveOrderDto } from './dto/save-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async getOrderDetails(
    products: ProductInOrder[],
    status?: number,
    tokenPayload?: TokenPayload,
  ) {
    return await Promise.all(
      products.map(async (product) => {
        let toppingExist = {} as Prisma.ToppingCreateInput;
        const productExist = (await this.commonService.findByIdWithBranch(
          product.id,
          'Product',
          tokenPayload.branchId,
        )) as Prisma.ProductCreateInput;

        if (product.toppingId)
          toppingExist = (await this.commonService.findByIdWithBranch(
            product.toppingId,
            'Product',
            tokenPayload.branchId,
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
          branchId: tokenPayload.branchId,
          createdBy: tokenPayload.accountId,
          updatedBy: tokenPayload.accountId,
        } as Prisma.OrderDetailCreateManyInput;
      }),
    );
  }

  async create(data: CreateOrderDto, tokenPayload: TokenPayload) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      DETAIL_ORDER_STATUS.DONE,
      tokenPayload,
    );

    await this.commonService.checkDataExistingInBranch(
      { code: data.code },
      'Order',
      tokenPayload.branchId,
    );

    return await this.prisma.order.create({
      data: {
        note: data.note,
        orderType: ORDER_TYPE.OFFLINE,
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
        creator: {
          connect: {
            id: tokenPayload.accountId,
            isPublic: true,
          },
        },
      },
      select: {
        id: true,
        code: true,
        orderType: true,
        note: true,
        paymentMethod: true,
        orderStatus: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
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
            topping: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                photoURL: true,
              },
            },
          },
        },
        updater: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                photoURL: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createOrderToTableByEmployee(
    data: CreateOrderToTableDto,
    tokenPayload: TokenPayload,
  ) {
    const orderDetails = await this.getOrderDetails(
      data.products,
      DETAIL_ORDER_STATUS.APPROVED,
      tokenPayload,
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
      DETAIL_ORDER_STATUS.WAITING,
      { branchId: data.branchId },
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
      DETAIL_ORDER_STATUS.WAITING,
      { branchId: data.branchId },
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
        orderType: ORDER_TYPE.ONLINE,
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
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async paymentFromTable(
    data: PaymentFromTableDto,
    tokenPayload: TokenPayload,
  ) {
    const newOrder = await this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          code: data.code || generateOrderCode(),
          note: data.note,
          orderType: ORDER_TYPE.OFFLINE,
          orderStatus: DETAIL_ORDER_STATUS.DONE,
          paymentMethod: data.paymentMethod,
          isPaid: true,
          ...(data.customerId && {
            customer: {
              connect: {
                id: data.customerId,
              },
            },
          }),
          creator: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
          updater: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
          branch: {
            connect: {
              id: tokenPayload.branchId,
              isPublic: true,
            },
          },
        },
      });

      const orderDetails = await prisma.orderDetail.updateMany({
        data: {
          tableId: null,
          updatedBy: tokenPayload.accountId,
        },
        where: {
          isPublic: true,
          status: {
            not: DETAIL_ORDER_STATUS.DONE,
          },
          table: {
            isPublic: true,
            id: data.tableId,
          },
        },
      });

      await prisma.tableTransaction.updateMany({
        data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId,
        },
        where: {
          isPublic: true,
          table: {
            isPublic: true,
            id: data.tableId,
          },
        },
      });

      if (orderDetails.count === 0)
        throw new CustomHttpException(
          HttpStatus.NOT_FOUND,
          '#1 paymentFromTable - Không tìm thấy sản phẩm!',
        );

      return order;
    });

    return newOrder;
  }

  async update(
    params: {
      where: Prisma.OrderWhereUniqueInput;
      data: UpdateOrderDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return await this.prisma.order.update({
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
        cancelReason: data.cancelReason,
        cancelDate: data.cancelDate,
        updater: {
          connect: {
            id: tokenPayload.accountId,
            isPublic: true,
          },
        },
      },
    });
  }

  async mergeTable(data: CombineTableDto, tokenPayload: TokenPayload) {
    const { fromTableId, toTableId } = data;

    await this.prisma.$transaction(async (prisma) => {
      await prisma.orderDetail.updateMany({
        data: {
          tableId: toTableId,
        },
        where: {
          isPublic: true,
          table: {
            isPublic: true,
            id: fromTableId,
          },
        },
      });

      await prisma.tableTransaction.create({
        data: {
          type: TRANSACTION_TYPE.MERGE,
          table: {
            connect: {
              id: data.fromTableId,
            },
          },
          branch: {
            connect: {
              id: tokenPayload.branchId,
              isPublic: true,
            },
          },
          creator: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
        },
      });

      await prisma.tableTransaction.create({
        data: {
          type: TRANSACTION_TYPE.MERGED,
          table: {
            connect: {
              id: data.toTableId,
            },
          },
          branch: {
            connect: {
              id: tokenPayload.branchId,
              isPublic: true,
            },
          },
          creator: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
        },
      });
    });
  }

  async separateTable(data: SeparateTableDto, tokenPayload: TokenPayload) {
    const { fromTableId, toTableId, orderDetailIds } = data;

    await this.prisma.$transaction(async (prisma) => {
      await prisma.orderDetail.updateMany({
        data: {
          tableId: toTableId,
          updatedBy: tokenPayload.accountId,
        },
        where: {
          id: {
            in: orderDetailIds,
          },
          isPublic: true,
          table: {
            isPublic: true,
            id: fromTableId,
          },
        },
      });

      await prisma.tableTransaction.create({
        data: {
          type: TRANSACTION_TYPE.MOVE,
          branch: {
            connect: {
              id: tokenPayload.branchId,
              isPublic: true,
            },
          },
          table: {
            connect: {
              id: data.fromTableId,
            },
          },
          orderDetails: {
            connect: orderDetailIds.map((id) => ({ id })),
          },
          creator: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
        },
      });

      await prisma.tableTransaction.create({
        data: {
          type: TRANSACTION_TYPE.MOVED,
          branch: {
            connect: {
              id: tokenPayload.branchId,
              isPublic: true,
            },
          },
          table: {
            connect: {
              id: data.toTableId,
            },
          },
          orderDetails: {
            connect: orderDetailIds.map((id) => ({ id })),
          },
          creator: {
            connect: {
              id: tokenPayload.accountId,
              isPublic: true,
            },
          },
        },
      });
    });
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
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
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
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
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
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          code: true,
          isPaid: true,
          orderStatus: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
              email: true,
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

  async findUniq(
    where: Prisma.OrderWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.order.findFirstOrThrow({
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
        isPublic: true,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            email: true,
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
            topping: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
              },
            },
          },
        },
      },
    });
  }

  async saveOrder(
    params: {
      where: Prisma.OrderWhereUniqueInput;
      data: SaveOrderDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;
    return await this.prisma.order.update({
      where: {
        id: where.id,
        branch: { isPublic: true, id: tokenPayload.branchId },
      },
      data: {
        isSave: data.isSave,
        note: data.note,
      },
    });
  }

  async removeMany(deleteManyDto: DeleteManyDto, tokenPayload: TokenPayload) {
    return await this.prisma.order.updateMany({
      where: {
        id: {
          in: deleteManyDto.ids,
        },
        branch: { isPublic: true, id: tokenPayload.branchId },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findAllByCustomer(
    params: FindManyDto,
    tokenCustomerPayload: TokenCustomerPayload,
  ) {
    let { skip, take, keyword, from, to } = params;

    const keySearch = ['code'];

    let where: Prisma.OrderWhereInput = {
      isPublic: true,
      customerId: tokenCustomerPayload.customerId,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      ...(from &&
        to && {
          createdAt: {
            gte: from,
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
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
            lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          code: true,
          isPaid: true,
          orderStatus: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
              email: true,
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

  async findUniqByCustomer(
    where: Prisma.OrderWhereUniqueInput,
    tokenCustomerPayload: TokenCustomerPayload,
  ) {
    return this.prisma.order.findFirstOrThrow({
      where: {
        id: where.id,
        isPublic: true,
        customerId: tokenCustomerPayload.customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            email: true,
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
            topping: {
              select: {
                id: true,
                name: true,
                photoURLs: true,
              },
            },
          },
        },
      },
    });
  }
}
