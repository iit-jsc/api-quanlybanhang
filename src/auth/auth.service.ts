import {
  LoginDto,
  LoginForCustomerDto,
  LoginForManagerDto,
  LoginForStaffDto,
} from './dto/login.dto';
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

  async loginForStaff(data: LoginForStaffDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        username: {
          contains: data.username,
        },
        // branches: {
        //   some: {},
        // },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!account || !(await bcrypt.compare(data.password, account.password))) {
      throw new CustomHttpException(
        HttpStatus.UNAUTHORIZED,
        '#1 loginForStaff - Tài khoản hoặc mật khẩu không chính xác!',
      );
    }

    if (account.status == ACCOUNT_STATUS.INACTIVE) {
      throw new CustomHttpException(
        HttpStatus.FORBIDDEN,
        '#2 loginForStaff - Tài khoản đã bị khóa!',
      );
    }

    const shops = await this.commonService.findManyShopByAccountId(account.id);

    const payload = { accountId: account.id };

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
      shops,
    };
  }

  async loginForManager(data: LoginForManagerDto) {
    await this.commonService.confirmOTP({
      code: data.otp,
      phone: data.phone,
    });

    const account = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        username: {
          equals: data.phone,
        },
        status: ACCOUNT_STATUS.ACTIVE,
      },
    });

    if (!account)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        '#1 loginForManager - Tài khoản không tồn tại hoặc đã bị khóa!',
      );

    const shops = await this.commonService.findManyShopByAccountId(account.id);

    const payload = { accountId: account.id };

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
      }),
      shops,
    };
  }

  async loginForCustomer(data: LoginForCustomerDto) {
    await this.commonService.confirmOTP({
      code: data.code,
      phone: data.phone,
    });

    const customer = await this.prisma.customer.findFirstOrThrow({
      where: {
        phone: data.phone,
        isPublic: true,
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
        id: tokenPayload.accountId,
        isPublic: true,
        status: ACCOUNT_STATUS.ACTIVE,
        branches: {
          some: {
            id: accessBranchDto.branchId,
            isPublic: true,
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

    const shop = await this.prisma.shop.findFirst({
      where: {
        isPublic: true,
        branches: {
          some: {
            id: accessBranchDto.branchId,
            isPublic: true,
          },
        },
      },
    });

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

    return await this.prisma.phoneVerification.create({
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
