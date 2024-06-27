import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateShopDto } from './dto/create-shop.dto';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';
import { BRANCH_STATUS } from 'enums/branch.enum';
import { CommonService } from 'src/common/common.service';
import { CustomHttpException } from 'utils/ApiErrors';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}

  async create(data: CreateShopDto) {
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
