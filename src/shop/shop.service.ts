import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateShopDTO } from './dto/create-shop.dto';
import { ACCOUNT_STATUS, USER_TYPE } from 'enums/user.enum';
import { UserService } from 'src/user/user.service';
import { CreateAccountDTO } from 'src/account/dto/create-account.dto';
import { BRANCH_STATUS } from 'enums/branch.enum';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(data: CreateShopDTO) {
    const { user, branch } = data;

    await this.prisma.$transaction(async (prisma) => {
      const userExisted = await this.userService.findByPhoneWithType(
        user.phone,
        USER_TYPE.STORE_OWNER,
      );

      let ownerShop = userExisted;

      if (!userExisted)
        ownerShop = await prisma.user.create({
          data: {
            name: user.name,
            phone: user.phone,
            email: user.email,
            type: USER_TYPE.STORE_OWNER,
            accounts: {
              create: {
                password: bcrypt.hashSync(user.account.password, 10),
                status: ACCOUNT_STATUS.ACTIVE,
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
          users: {
            connect: {
              id: ownerShop.id,
            },
          },
          branches: {
            create: {
              name: branch.name,
              address: branch.address,
              status: BRANCH_STATUS.ACTIVE,
              detailPermissions: {
                create: {
                  userId: ownerShop.id,
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
