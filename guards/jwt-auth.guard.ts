import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenCustomer, TokenPayload } from 'interfaces/common.interface';
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
        '#1 canActivate - Không tim thấy token!',
      );

    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      })) as TokenPayload;

      const account = await this.prisma.account.findUniqueOrThrow({
        where: { id: payload.accountId, isPublic: true },
      });

      request.tokenPayload = { ...payload, type: account.type };
    } catch (error) {
      throw new CustomHttpException(
        HttpStatus.UNAUTHORIZED,
        '#2 canActivate - Token hết hạn!',
      );
    }

    return true;
  }
}

@Injectable()
export class JwtCustomerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const [_, token] = authHeader.split(' ');

    if (!token)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        '#1 canActivate - Không tìm thấy token!',
      );

    const payload: TokenCustomer = this.jwtService.decode(token);

    request.tokenPayload = payload;

    return true;
  }
}
