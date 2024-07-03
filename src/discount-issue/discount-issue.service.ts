import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateDiscountIssueDto,
  UpdateDiscountIssueDto,
} from './dto/discount-issue.dto';
import { FindManyDto } from 'utils/Common.dto';

@Injectable()
export class DiscountIssueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDiscountIssueDto, tokenPayload: TokenPayload) {}

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {}

  async findUniq(
    where: Prisma.DiscountIssueWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {}

  async update(
    params: {
      where: Prisma.DiscountIssueWhereUniqueInput;
      data: UpdateDiscountIssueDto;
    },
    tokenPayload: TokenPayload,
  ) {}

  async deleteMany(
    where: Prisma.DiscountIssueWhereInput,
    tokenPayload: TokenPayload,
  ) {}
}
