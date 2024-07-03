import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateShopDto, RegisterShopDto } from './dto/create-shop.dto';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';
import { BRANCH_STATUS } from 'enums/shop.enum';
import { CommonService } from 'src/common/common.service';
import { CustomHttpException } from 'utils/ApiErrors';
import { AuthService } from 'src/auth/auth.service';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { FindManyDto } from 'utils/Common.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { calculatePagination } from 'utils/Helps';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}

  async registerShop(data: RegisterShopDto) {
    const { user, branch } = data;

    await this.commonService.confirmOTP({
      code: data.otp,
      phone: data.user.phone,
    });

    const { newShop, accountId } = await this.prisma.$transaction(
      async (prisma) => {
        // Kiểm tra tài khoản tồn tại chưa
        let ownerShopAccount = await this.prisma.account.findFirst({
          where: {
            isPublic: true,
            OR: [
              { type: ACCOUNT_TYPE.MANAGER },
              { type: ACCOUNT_TYPE.STORE_OWNER },
            ],
            username: {
              equals: user.phone,
            },
          },
        });

        if (ownerShopAccount)
          throw new CustomHttpException(
            HttpStatus.CONFLICT,
            '#1 create - Tài khoản đã tồn tại!',
          );

        let ownerShop = await prisma.user.create({
          data: {
            name: user.name,
            phone: user.phone,
            email: user.email,
            account: {
              create: {
                username: user.phone,
                status: ACCOUNT_STATUS.ACTIVE,
                type: ACCOUNT_TYPE.STORE_OWNER,
              },
            },
          },
          select: {
            id: true,
            account: true,
          },
        });

        const shopCode = await this.generateShopCode();

        const newShop = await prisma.shop.create({
          data: {
            name: data.name,
            code: shopCode,
            businessTypeId: data.businessTypeId,
            branches: {
              create: {
                name: branch.name,
                address: branch.address,
                status: BRANCH_STATUS.ACTIVE,
                accounts: {
                  connect: {
                    id: ownerShop.account.id,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            branches: true,
          },
        });

        return { newShop, accountId: ownerShop.account.id };
      },
    );

    return await this.authService.accessBranch(
      { branchId: newShop?.branches?.[0]?.id },
      { accountId },
    );
  }

  async create(data: CreateShopDto, tokenPayload: TokenPayload) {
    return this.prisma.shop.create({
      data: {
        code: await this.generateShopCode(),
        name: data.name,
        businessTypeId: data.businessTypeId,
        photoURL: data.photoURL,
        status: data.status,
        branches: {
          create: {
            name: data.branch?.name,
            address: data.branch?.address,
            photoURL: data.photoURL,
            accounts: {
              connect: {
                id: tokenPayload.accountId,
              },
            },
          },
        },
        createdBy: tokenPayload.accountId,
      },
    });
  }

  async update(
    params: {
      where: Prisma.ShopWhereUniqueInput;
      data: UpdateShopDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { where, data } = params;

    return this.prisma.shop.update({
      data: {
        name: data.name,
        businessTypeId: data.businessTypeId,
        status: data.status,
        photoURL: data.photoURL,
        updatedBy: tokenPayload.accountId,
      },
      where: {
        id: where.id,
        isPublic: true,
        branches: {
          some: {
            accounts: {
              some: {
                id: tokenPayload.accountId,
                type: ACCOUNT_TYPE.STORE_OWNER,
              },
            },
          },
        },
      },
    });
  }

  async deleteMany(where: Prisma.ShopWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.shop.updateMany({
      where: {
        id: where.id,
        isPublic: true,
        branches: {
          some: {
            accounts: {
              some: {
                id: tokenPayload.accountId,
                type: ACCOUNT_TYPE.STORE_OWNER,
              },
            },
          },
        },
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findUniq(
    where: Prisma.ShopWhereUniqueInput,
    tokenPayload: TokenPayload,
  ) {
    return this.prisma.shop.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branches: {
          some: {
            accounts: {
              some: {
                id: tokenPayload.accountId,
              },
            },
          },
        },
      },
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, keyword } = params;

    const keySearch = ['name', 'code'];

    let where: Prisma.ShopWhereInput = {
      isPublic: true,
      branches: {
        some: {
          accounts: {
            some: {
              id: tokenPayload.accountId,
            },
          },
        },
      },
      ...(keyword && {
        OR: keySearch.map((key) => ({
          [key]: { contains: keyword, mode: 'insensitive' },
        })),
      }),
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.shop.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        where,
      }),
      this.prisma.shop.count({
        where,
      }),
    ]);
    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async generateShopCode() {
    const shop = await this.prisma.shop.findFirst({
      orderBy: {
        code: 'desc',
      },
      select: {
        code: true,
      },
    });

    if (!shop) return 'IIT0001';

    const numberPart = +shop.code.slice(3);

    const nextNumber = (numberPart + 1).toString().padStart(4, '0');

    return `IIT${nextNumber}`;
  }
}
