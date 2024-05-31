import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { CreateOrderByEmployeeDto } from './dto/create-order-by-employee.dto';
import { CommonService } from 'src/common/common.service';
import { calculatePagination } from 'utils/Helps';
import { PRICE_TYPE } from 'enums/product.enum';
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
    const orderDetails = await Promise.all(
      data.products.map(async (product) => {
        const productExist = (await this.commonService.findByIdWithBranch(
          product.id,
          'Product',
          tokenPayload.branchId,
        )) as Prisma.ProductCreateInput;

        return {
          price: this.getPrice(productExist, product.priceType),
          toppingId: product.toppingId,
          productId: product.id,
          amount: product.amount,
          branchId: tokenPayload.branchId,
        } as Prisma.OrderDetailCreateManyInput;
      }),
    );

    return this.prisma.order.create({
      data: {
        note: data.note,
        orderDate: new Date(),
        paymentMethod: data.paymentMethod,
        orderDetails: {
          createMany: {
            data: orderDetails,
          },
        },
        ...(data.customerId && {
          customer: {
            connect: {
              id: data.customerId,
            },
          },
        }),
        ...(data.tableId && {
          table: {
            connect: {
              id: data.tableId,
            },
          },
        }),
        ...(data.orderStatusId && {
          orderStatus: {
            connect: {
              id: data.orderStatusId,
            },
          },
        }),
        branch: {
          connect: {
            id: tokenPayload.branchId,
            isPublic: true,
          },
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
      },
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
    });
  }

  async createByCustomer() {}

  getPrice(product: Prisma.ProductCreateInput, priceType: number) {
    return priceType === PRICE_TYPE.IMPORT_PRICE
      ? product.importPrice
      : priceType === PRICE_TYPE.RETAIL_PRICE
        ? product.retailPrice
        : product.wholesalePrice;
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
