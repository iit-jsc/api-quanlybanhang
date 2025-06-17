import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly WHITELIST_IPS = [
    '127.0.0.1',
    '::1',
    'localhost'
    // Thêm các IP được phép truy cập admin
  ]

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const clientIp = this.getClientIp(request)

    // Kiểm tra nếu đây là route cần whitelist
    const requiresWhitelist = this.reflector.get<boolean>('whitelist', context.getHandler())

    if (!requiresWhitelist) {
      return true
    }

    if (!this.WHITELIST_IPS.includes(clientIp)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Truy cập từ IP này không được phép',
          error: 'Forbidden'
        },
        HttpStatus.FORBIDDEN
      )
    }

    return true
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0].trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    )
  }
}
