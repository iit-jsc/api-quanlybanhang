import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { UserService } from 'src/user/user.service';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const [_, token] = authHeader.split(' ');

    if (!token)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Không tim thấy token!',
      );

    const payload: TokenPayload = this.jwtService.decode(token);

    const user = await this.prisma.user.findFirst({
      where: {
        isPublic: true,
        accounts: {
          some: {
            id: payload.accountId,
          },
        },
      },
    });

    request.tokenPayload = { ...payload, type: user.type };

    return true;
  }
}
