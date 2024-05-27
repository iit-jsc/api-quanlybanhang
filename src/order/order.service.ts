import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { FindManyDto } from 'utils/Common.dto';
import { CreateOrderByEmployeeDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createByEmployee(
    data: CreateOrderByEmployeeDto,
    tokenPayload: TokenPayload,
  ) {}

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
