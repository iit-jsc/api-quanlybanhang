import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateShopDTO } from './dto/create-shop.dto';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';
import { UserService } from 'src/user/user.service';
import { CreateAccountDTO } from 'src/account/dto/create-account.dto';
import { BRANCH_STATUS } from 'enums/branch.enum';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService,
  ) {}

  async create(data: CreateShopDTO) {
    const { user, branch } = data;

    await this.prisma.$transaction(async (prisma) => {
      let ownerShop = await this.commonService.findUserByPhoneWithType(
        user.phone,
        ACCOUNT_TYPE.STORE_OWNER,
      );

      if (!ownerShop)
        ownerShop = await prisma.user.create({
          data: {
            name: user.name,
            phone: user.phone,
            email: user.email,
            accounts: {
              create: {
                password: bcrypt.hashSync(user.account.password, 10),
                status: ACCOUNT_STATUS.ACTIVE,
                type: ACCOUNT_TYPE.STORE_OWNER,
              },
            },
          },
        });

      const shopCode = await this.generateShopCode();

      await prisma.shop.create({
        data: {
          name: data.name,
          code: shopCode,
          businessTypeId: data.businessTypeId,
          branches: {
            create: {
              name: branch.name,
              address: branch.address,
              status: BRANCH_STATUS.ACTIVE,
              users: {
                connect: {
                  id: ownerShop.id,
                },
              },
            },
          },
        },
      });
    });

    return;
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
