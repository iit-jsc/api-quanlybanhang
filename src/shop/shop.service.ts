import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateShopDto } from './dto/create-shop.dto';
import { ACCOUNT_STATUS, USER_TYPE } from 'enums/user.enum';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateShopDto) {
    const { user, branch } = data;
    await this.prisma
      .$transaction(async (prisma) => {
        const newShopOwner = await prisma.user.create({
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

        return newShopOwner;
      })
      .catch((error) => {
        throw error;
      });
  }
}
