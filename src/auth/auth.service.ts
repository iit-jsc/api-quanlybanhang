import { LoginDto, LoginWithCustomerDto } from './dto/login.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { mapResponseLogin } from 'map-responses/account.map-response';
import { CustomHttpException } from 'utils/ApiErrors';
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from 'enums/user.enum';
import { AccessBranchDto } from './dto/access-branch.dto';
import { TokenCustomer, TokenPayload } from 'interfaces/common.interface';
import { CommonService } from 'src/common/common.service';
import { Prisma } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { VerifyPhoneDto } from 'src/shop/dto/verify-phone.dto';

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
        username: {
          contains: loginDto.username,
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

    const shops = await this.commonService.findManyShopByAccountId(account.id);

    const payload = { accountId: account.id };

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: '5m',
      }),
      shops,
    };
  }

  async loginWithCustomer(data: LoginWithCustomerDto) {
    await this.commonService.confirmOTP({
      code: data.code,
      phone: data.phone,
    });

    const customer = await this.prisma.customer.findFirstOrThrow({
      where: {
        phone: data.phone,
        shop: {
          id: data.shopId,
          isPublic: true,
        },
      },
    });

    return {
      accessToken: await this.jwtService.signAsync(
        {
          customerId: customer.id,
        } as TokenCustomer,
        {
          expiresIn: '48h',
        },
      ),
      customer,
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

  async verifyPhone(data: VerifyPhoneDto) {
    const client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const otp = (Math.floor(Math.random() * 900000) + 100000).toString();

    await this.prisma.phoneVerification.create({
      data: { code: otp, phone: data.phone },
    });

    // return await client.messages.create({
    //   body: 'Your verification code is: ' + otp,
    //   from: process.env.TWILIO_ACCOUNT_PHONE,
    //   to: '+84' + data.phone.substring(1),
    // });
  }

  async register(registerDto: RegisterDto) {}
}
