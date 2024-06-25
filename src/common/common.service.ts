import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DETAIL_ORDER_STATUS } from 'enums/order.enum';
import { EMPLOYEE_GROUP_SELECT } from 'enums/select.enum';
import { AnyObject } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { permission } from 'process';
import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { ConfirmPhoneDto } from 'src/shop/dto/confirm-phone.dto';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadPhotoURLs(data: { photoURLs: string[] }) {
    return data.photoURLs;
  }

  async findUserByAccountId(id: number) {
    return this.prisma.user.findFirst({
      where: {
        isPublic: true,
        accounts: {
          some: {
            id,
          },
        },
      },
    });
  }

  async findManyShopByAccountId(id: number) {
    return await this.prisma.shop.findMany({
      where: {
        isPublic: true,
        branches: {
          some: {
            isPublic: true,
            accounts: {
              some: {
                id,
                isPublic: true,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        photoURL: true,
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            photoURL: true,
          },
          where: {
            isPublic: true,
            users: {
              some: {
                id,
                isPublic: true,
              },
            },
          },
        },
        businessType: {
          where: {
            isPublic: true,
          },
        },
      },
    });
  }

  async findShopByCondition(where: Prisma.ShopWhereInput) {
    return await this.prisma.shop.findFirst({
      where: {
        isPublic: true,
        ...where,
      },
    });
  }

  async findUserByPhone(phone: string, type: number) {
    return this.prisma.user.findFirst({
      where: {
        isPublic: true,
        phone,
      },
    });
  }

  async findByIdWithBranch(
    id: number,
    model: Prisma.ModelName,
    branchId: number,
  ) {
    return this.prisma[model].findFirstOrThrow({
      where: {
        isPublic: true,
        id,
        branchId: branchId,
      },
    });
  }

  async findByIdWithShop(id: number, model: Prisma.ModelName, shopId: number) {
    return this.prisma[model].findFirstOrThrow({
      where: {
        isPublic: true,
        id,
        shop: {
          id: shopId,
          isPublic: true,
        },
      },
    });
  }

  async findOrCreateCustomer(
    data: { name: string; email: string; address: string; phone: string },
    where: { phone: string; branchId: number },
  ) {
    const shop = await this.prisma.shop.findFirst({
      where: {
        branches: {
          some: {
            id: where.branchId,
            isPublic: true,
          },
        },
      },
    });

    // return this.prisma.customer.upsert({
    //   where: {
    //     phone_shopId_isPublic: {
    //       phone: where.phone,
    //       shopId: shop.id,
    //       isPublic: true,
    //     },
    //   },
    //   create: {
    //     name: data.name,
    //     phone: data.phone,
    //     email: data.email,
    //     address: data.email,
    //     shop: {
    //       connect: {
    //         id: shop.id,
    //       },
    //     },
    //   },
    //   update: { name: data.name, address: data.email },
    // });
  }

  async checkTableIsReady(id: number) {
    const table = await this.prisma.table.findFirst({
      where: {
        id,
        isPublic: true,
        NOT: {
          orderDetails: {
            some: {},
          },
        },
      },
    });

    if (!table)
      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkTableIsReady - Bàn này không sẵn sàng!',
      );
  }

  async confirmOTP(data: ConfirmPhoneDto) {
    const otp = await this.prisma.phoneVerification.findFirst({
      where: {
        code: data.code,
        phone: data.phone,
        isUsed: false,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (!otp)
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        '#1 confirmOTP - Mã OTP không hợp lệ!',
      );

    await this.prisma.phoneVerification.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });
  }

  async checkDataExistingInBranch<T extends AnyObject>(
    data: T[],
    model: string,
    branchId: number,
    id?: number,
  ) {
    let conflictingKeys: string[] = [];

    const result = await this.prisma[model].findFirst({
      where: {
        isPublic: true,
        branchId: branchId,
        OR: data.map((item) => {
          const key = Object.keys(item)[0];
          const value = Object.values(item)[0];
          return {
            [key]: { equals: value, mode: 'insensitive' },
          };
        }),
      },
    });

    if (result && result.id !== id) {
      conflictingKeys = data.reduce((keys: string[], item) => {
        const key = Object.keys(item)[0];
        const value = Object.values(item)[0];
        if (result[key] === value) {
          keys.push(key);
        }
        return keys;
      }, []);

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        `#1 checkDataExistingInBranch - Dữ liệu đã tồn tại!`,
        conflictingKeys.map((item) => ({
          [item]: 'Dữ liệu đã được sử dụng!',
        })),
      );
    }
  }
}
