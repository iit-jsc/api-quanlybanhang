import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AccountCreateInput) {
    return this.prisma.account.create({
      data,
      include: {
        user: true,
      },
    });
  }
}
