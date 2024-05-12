import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomHttpException } from 'utils/ApiErrors';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

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
}
