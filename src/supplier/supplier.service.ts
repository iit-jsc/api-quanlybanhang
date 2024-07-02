import { Injectable } from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { FindManyDto } from 'utils/Common.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSupplierDto, tokenPayload: TokenPayload) {
    // return this.prisma.supplier.create({
    //   data: {},
    // });
  }

  update(
    params: {
      where: Prisma.SupplierWhereUniqueInput;
      data: UpdateSupplierDto;
    },
    tokenPayload: TokenPayload,
  ) {}

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {}

  findUniq(
    where: Prisma.SupplierWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {}

  deleteMany(where: Prisma.SupplierWhereInput, tokenPayload: TokenPayload) {}
}
