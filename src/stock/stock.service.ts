import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { TokenPayload } from 'interfaces/common.interface';
import { FindManyDto } from 'utils/Common.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {}

  async findUniq(
    where: Prisma.StockWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {}
}
