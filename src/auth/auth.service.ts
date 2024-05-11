import { LoginDto } from './dto/login-dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { mapResponseLogin } from 'map-responses/account.map-response';
import { createApiResponse } from 'utils/ApiResponse';
import { CustomHttpException } from 'utils/ApiErrors';
import { ACCOUNT_STATUS } from 'enums/user.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        user: {
          isPublic: true,
          phone: loginDto.phone,
          shops: {
            some: { id: loginDto.shopId, isPublic: true },
          },
        },
      },
      include: {
        user: {
          include: {
            shops: {
              select: {
                id: true,
                photoURL: true,
                name: true,
                branches: {
                  select: {
                    id: true,
                    photoURL: true,
                    name: true,
                    address: true,
                  },
                },
              },
            },
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
        'Tài khoản hoặc mật khẩu không chính xác!',
      );
    }

    if (account.status == ACCOUNT_STATUS.INACTIVE) {
      throw new CustomHttpException(
        HttpStatus.FORBIDDEN,
        'Tài khoản đã bị khóa!',
      );
    }

    const payload = { id: account.id };

    return {
      access_token: await this.jwtService.signAsync(payload),
      ...mapResponseLogin(account),
    };
  }
}
