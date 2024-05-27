import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { CreateOrderByEmployeeDto } from './dto/create-order-by-employee.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createByEmployee(
    data: CreateOrderByEmployeeDto,
    tokenPayload: TokenPayload,
  ) {
    // return this.prisma.order.create({
    //   data: {
    //     tableId: data.tableId,
    //     customerId: data.customerId,
    //     note: data.note,
    //     paymentMethodId: data.paymentMethodId,
    //     orderDate: new Date(),
    //     branch: {
    //       connect: {
    //         id: tokenPayload.branchId,
    //         isPublic: true,
    //       },
    //     },
    //     createdBy: tokenPayload.accountId,
    //     updatedBy: tokenPayload.accountId,
    //   },
    // });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {}

  async findUniq(
    where: Prisma.AreaWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {}

  async update(
    params: {
      where: Prisma.AreaWhereUniqueInput;
      data: CreateOrderByEmployeeDto;
    },
    tokenPayload: TokenPayload,
  ) {}

  async removeMany(where: Prisma.AreaWhereInput, tokenPayload: TokenPayload) {}
}
