import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';
import { PrismaService } from 'nestjs-prisma';
import { CommonService } from 'src/common/common.service';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class ManagerService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateManagerDto, tokenPayload: TokenPayload) {
    await this.commonService.checkUserExisting(
      { phone: data.phone, email: data.email },
      tokenPayload.shopId,
    );

    await this.commonService.checkAccountExisting(
      { username: data.username },
      tokenPayload.shopId,
    );

    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          sex: data.sex,
          birthday: data.birthday,
          cardDate: data.cardDate,
          startDate: data.startDate,
          photoURL: data.photoURL,
          address: data.address,
          cardId: data.cardId,
          cardAddress: data.cardAddress,
          createdBy: tokenPayload.accountId,
        },
      });

      await prisma.account.create({
        data: {
          username: data.username,
          password: bcrypt.hashSync(data.password, 10),
          status: ACCOUNT_STATUS.ACTIVE,
          type: ACCOUNT_TYPE.MANAGER,
          user: {
            connect: {
              id: user.id,
            },
          },
          branches: { connect: data.branchIds?.map((id: number) => ({ id })) },
        },
      });

      return user;
    });
  }

  async update(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: UpdateManagerDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    await this.commonService.checkUserExisting(
      { phone: data.phone, email: data.email },
      tokenPayload.shopId,
      where.id,
    );

    return this.prisma.user.update({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        sex: data.sex,
        birthday: data.birthday,
        cardDate: data.cardDate,
        startDate: data.startDate,
        photoURL: data.photoURL,
        address: data.address,
        cardId: data.cardId,
        cardAddress: data.cardAddress,
        updatedBy: tokenPayload.accountId,
        account: {
          update: {
            password: data.newPassword
              ? bcrypt.hashSync(data.newPassword, 10)
              : undefined,
            status: data.accountStatus,
            branches: {
              set: data.branchIds?.map((id: number) => ({ id })),
            },
          },
        },
      },
      where: {
        id: where.id,
      },
    });
  }

  async remove(where: Prisma.UserWhereUniqueInput, tokenPayload: TokenPayload) {
    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.update({
        where: {
          ...where,
          account: {
            branches: {
              some: {
                shopId: tokenPayload.shopId,
              },
            },
          },
          isPublic: true,
          branchId: tokenPayload.branchId,
        },
        data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId,
        },
        select: {
          account: true,
        },
      });

      await prisma.account.update({
        where: {
          id: user.account.id,
          isPublic: true,
        },
        data: {
          isPublic: false,
          updatedBy: tokenPayload.accountId,
        },
      });
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    const { skip, take, keyword } = params;

    const keySearch = ['name', 'code', 'email', 'phone'];

    const where: Prisma.UserWhereInput = {
      isPublic: true,
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
      account: {
        type: ACCOUNT_TYPE.MANAGER,
        branches: {
          some: {
            shopId: tokenPayload.shopId,
          },
        },
      },
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
        select: {
          id: true,
          name: true,
          code: true,
          phone: true,
          email: true,
          address: true,
          cardId: true,
          cardDate: true,
          cardAddress: true,
          birthday: true,
          sex: true,
          startDate: true,
          photoURL: true,
          account: {
            select: {
              type: true,
              username: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(
    where: Prisma.UserWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        account: {
          type: ACCOUNT_TYPE.MANAGER,
          branches: {
            some: {
              shopId: tokenPayload.shopId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        phone: true,
        email: true,
        address: true,
        cardId: true,
        cardDate: true,
        cardAddress: true,
        birthday: true,
        sex: true,
        startDate: true,
        photoURL: true,
        account: {
          select: {
            type: true,
            username: true,
            status: true,
          },
        },
      },
    });
  }
}
