import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DETAIL_ORDER_STATUS } from 'enums/order.enum';
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
            accounts: {
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
        isPublic: true,
      },
    });

    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        isPublic: true,
        phone: where.phone,
        shop: {
          branches: {
            some: {
              id: where.branchId,
              isPublic: true,
            },
          },
          isPublic: true,
        },
      },
    });

    return existingCustomer
      ? this.prisma.customer.update({
          where: { id: existingCustomer.id },
          data,
        })
      : this.prisma.customer.create({
          data: {
            ...data,
            isPublic: true,
            shop: {
              connect: { id: shop.id },
            },
          },
        });
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

    // if (!otp)
    //   throw new CustomHttpException(
    //     HttpStatus.BAD_REQUEST,
    //     '#1 confirmOTP - Mã OTP không hợp lệ!',
    //   );

    // await this.prisma.phoneVerification.update({
    //   where: { id: otp.id },
    //   data: { isUsed: true },
    // });
  }

  async checkDataExistingInBranch<T extends AnyObject>(
    data: T,
    model: string,
    branchId: number,
    id?: number,
  ) {
    let conflictingKeys: string[] = [];

    const result = await this.prisma[model].findFirst({
      where: {
        isPublic: true,
        branchId: branchId,
        OR: Object.keys(data).map((key) => ({
          [key]: { equals: data[key], mode: 'insensitive' },
        })),
      },
    });

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(
        (key) => result[key] === data[key],
      );

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkDataExistingInBranch - Dữ liệu đã tồn tại!',
        conflictingKeys.map((key) => ({ [key]: 'Dữ liệu đã được sử dụng!' })),
      );
    }
  }

  async checkDataExistingInShop<T extends AnyObject>(
    data: T,
    model: string,
    shopId: number,
    id?: number,
  ) {
    let conflictingKeys: string[] = [];

    const result = await this.prisma[model].findFirst({
      where: {
        isPublic: true,
        shopId: shopId,
        OR: Object.keys(data).map((key) => ({
          [key]: { equals: data[key], mode: 'insensitive' },
        })),
      },
    });

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(
        (key) => result[key] === data[key],
      );

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkDataExistingInShop - Dữ liệu đã tồn tại!',
        conflictingKeys.map((key) => ({ [key]: 'Dữ liệu đã được sử dụng!' })),
      );
    }
  }

  async generateBranchCode() {
    // const shop = await this.prisma.branch.findFirst({
    //   orderBy: {
    //     code: 'desc',
    //   },
    //   select: {
    //     code: true,
    //   },
    // });
    // if (!shop) return 'IIT0001';
    // const numberPart = +shop.code.slice(3);
    // const nextNumber = (numberPart + 1).toString().padStart(4, '0');
    // return `IIT${nextNumber}`;
  }

  async checkAccountExisting<T extends AnyObject>(
    data: T,
    shopId: number,
    id?: number,
  ) {
    let conflictingKeys: string[] = [];

    const result = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        OR: Object.keys(data).map((key) => ({
          [key]: { equals: data[key], mode: 'insensitive' },
        })),
        branches: {
          some: {
            shopId: shopId,
          },
        },
      },
    });

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(
        (key) => result[key] === data[key],
      );

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkAccountExisting - Dữ liệu đã tồn tại!',
        conflictingKeys.map((key) => ({ [key]: 'Dữ liệu đã được sử dụng!' })),
      );
    }
  }

  async checkUserExisting<T extends AnyObject>(
    data: T,
    shopId: number,
    id?: number,
  ) {
    let conflictingKeys: string[] = [];

    const result = await this.prisma.user.findFirst({
      where: {
        isPublic: true,
        OR: Object.keys(data).map((key) => ({
          [key]: { equals: data[key], mode: 'insensitive' },
        })),
        account: {
          branches: {
            some: {
              shopId: shopId,
            },
          },
        },
      },
    });

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(
        (key) => result[key] === data[key],
      );

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        '#1 checkUserExisting - Dữ liệu đã tồn tại!',
        conflictingKeys.map((key) => ({ [key]: 'Dữ liệu đã được sử dụng!' })),
      );
    }
  }
}
