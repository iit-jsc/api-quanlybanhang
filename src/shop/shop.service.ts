import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateShopDTO } from './dto/create-shop.dto';
import { ACCOUNT_STATUS, USER_TYPE } from 'enums/user.enum';
import { UserService } from 'src/user/user.service';
import { CreateAccountDTO } from 'src/account/dto/create-account.dto';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(data: CreateShopDTO) {
    const { user, branch } = data;

    await this.prisma.$transaction(async (prisma) => {
      const newShopOwner = await this.userService.create({
        name: user.name,
        phone: user.phone,
        email: user.email,
        type: USER_TYPE.STORE_OWNER,
        account: {
          password: user.account.password,
          status: ACCOUNT_STATUS.ACTIVE,
        } as CreateAccountDTO,
      });

      await prisma.shop.create({
        data: {
          name: data.name,
          businessTypeId: data.businessTypeId,
          users: {
            connect: {
              id: newShopOwner.id,
            },
          },
          branches: {
            create: {
              name: branch.name,
              address: branch.address,
              detailPermissions: {
                create: {
                  userId: newShopOwner.id,
                },
              },
            },
          },
        },
      });
    });
  }
}
