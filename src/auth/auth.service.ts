import { LoginDto } from './dto/login-dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { mapResponseLogin } from 'map-responses/account.map-response';
import { CustomHttpException } from 'utils/ApiErrors';
import { ACCOUNT_STATUS } from 'enums/user.enum';
import { AccessBranchDTO } from './dto/access-branch-dto';
import { TokenPayload } from 'interfaces/common.interface';

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
          OR: [{ phone: loginDto.username }, { email: loginDto.username }],
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
        '#1 login - Tài khoản hoặc mật khẩu không chính xác!',
      );
    }

    if (account.status == ACCOUNT_STATUS.INACTIVE) {
      throw new CustomHttpException(
        HttpStatus.FORBIDDEN,
        '#2 login - Tài khoản đã bị khóa!',
      );
    }

    const payload = { accountId: account.id };

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: '5m',
      }),
      ...mapResponseLogin(account),
    };
  }

  async accessBranch(
    AccessBranchDTO: AccessBranchDTO,
    tokenPayload: TokenPayload,
  ) {
    const account = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        id: tokenPayload.accountId,
        user: {
          detailPermissions: {
            some: {
              branchId: AccessBranchDTO.branchId,
            },
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

    if (!account) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        '#1 accessBranch - Không tìm thấy tài nguyên!',
      );
    }

    return {
      accessToken: await this.jwtService.signAsync(
        {
          type: account.user.type,
          accountId: tokenPayload.accountId,
          branchId: tokenPayload.branchId,
          shopId: account.user.shops[0].id,
        } as TokenPayload,
        {
          expiresIn: '48h',
        },
      ),
      ...mapResponseLogin(account),
    };
  }
}
