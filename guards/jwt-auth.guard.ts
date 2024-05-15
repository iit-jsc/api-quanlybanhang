import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const [_, token] = authHeader.split(' ');

    if (!token)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Không tim thấy token!',
      );

    const payload = this.jwtService.decode(token);

    request.tokenPayload = payload;

    return true;
  }

  getAuth(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const [_, token] = authHeader.split(' ');

    if (!token)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Không tim thấy token!',
      );

    const payload = this.jwtService.decode(token);

    request.tokenPayload = payload;

    return true;
  }
}
