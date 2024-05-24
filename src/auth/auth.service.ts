import { LoginDto } from './dto/login-dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { mapResponseLogin } from 'map-responses/account.map-response';
import { CustomHttpException } from 'utils/ApiErrors';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';
import { AccessBranchDto } from './dto/access-branch-dto';
import { TokenPayload } from 'interfaces/common.interface';
import { SHOP_SELECT, USER_SELECT } from 'enums/select.enum';
import { CommonService } from 'src/common/common.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private commonService: CommonService,
  ) {}

  async login(loginDto: LoginDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        user: {
          isPublic: true,
          OR: [{ phone: loginDto.username }, { email: loginDto.username }],
          ...(loginDto.shopCode && {
            shops: {
              some: {
                isPublic: true,
                code: loginDto.shopCode,
              },
            },
          }),
          accounts: {
            some: {
              ...(loginDto.shopCode && { type: ACCOUNT_TYPE.STORE_OWNER }),
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      !account ||
      !(await bcrypt.compare(loginDto.password, account.password))
    ) {
      throw new CustomHttpException(
        HttpStatus.UNAUTHORIZED,
        '#1 login - Tài khoản hoặc mật khẩu không chính xác!',
      );
    }

    if (account.status == ACCOUNT_STATUS.INACTIVE) {
      throw new CustomHttpException(
        HttpStatus.FORBIDDEN,
        '#2 login - Tài khoản đã bị khóa!',
      );
    }

    const shops = await this.commonService.findManyShopByUserId(
      account.user.id,
    );

    const payload = { accountId: account.id };

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: '5m',
      }),
      shops,
    };
  }

  async accessBranch(
    accessBranchDto: AccessBranchDto,
    tokenPayload: TokenPayload,
  ) {
    const account = await this.prisma.account.findUnique({
      where: {
        isPublic: true,
        id: tokenPayload.accountId,
        user: {
          isPublic: true,
          branches: {
            some: {
              id: accessBranchDto.branchId,
              isPublic: true,
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    if (!account) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        '#1 accessBranch - Không tìm thấy tài nguyên!',
      );
    }

    const shop = await this.commonService.findShopByCondition({
      branches: {
        some: {
          id: accessBranchDto.branchId,
        },
      },
    } as Prisma.ShopWhereInput);

    return {
      accessToken: await this.jwtService.signAsync(
        {
          accountId: tokenPayload.accountId,
          branchId: accessBranchDto.branchId,
          shopId: shop.id,
        } as TokenPayload,
        {
          expiresIn: '48h',
        },
      ),
      ...mapResponseLogin(account),
    };
  }
}
