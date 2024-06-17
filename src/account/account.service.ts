import { TokenPayload } from './../../interfaces/common.interface';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateAccountDto } from './dto/create-account.dto';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAccountDto, tokenPayload: TokenPayload) {
    return this.prisma.account.create({
      data: {
        password: bcrypt.hashSync(data.password, 10),
        status: data.status || ACCOUNT_STATUS.ACTIVE,
        type: data.type,
        branches: {
          connect: {
            id: tokenPayload.branchId,
          },
        },
        user: {
          connect: {
            id: data.userId,
          },
        },
        permissions: {
          connect: data.permissionIds.map((id) => ({
            id,
          })),
        },
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
      },
      select: {
        id: true,
        status: true,
        type: true,
        username: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            photoURL: true,
          },
        },
      },
    });
  }
}
