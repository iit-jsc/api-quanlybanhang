import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { TokenCustomerPayload, TokenPayload } from 'interfaces/common.interface'
import { PrismaService } from 'nestjs-prisma'
import { AccountStatus } from '@prisma/client'
import { accountJWTAuthSelect } from 'responses/account.response'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context)

    const authHeader = this.getAuthHeader(context)
    const apiKeyHeader = request.headers?.['x-api-key'] || request.auth?.['x-api-key']

    if (!apiKeyHeader || apiKeyHeader !== process.env.X_API_KEY) {
      throw new HttpException('API key không hợp lệ!', HttpStatus.UNAUTHORIZED)
    }

    if (!authHeader) return false

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = authHeader.split(' ')

    if (!token) throw new HttpException('Không tìm thấy token!', HttpStatus.NOT_FOUND)

    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY
      })

      const account = await this.prisma.account.findUniqueOrThrow({
        where: {
          id: payload.accountId,
          status: AccountStatus.ACTIVE,
          branches: { some: { id: payload.branchId } }
        },
        select: accountJWTAuthSelect(payload.branchId)
      })

      if (account.status == AccountStatus.INACTIVE || account.status == AccountStatus.DELETED)
        throw new HttpException('Tài khoản đã bị khóa hoặc đã bị xóa!', HttpStatus.FORBIDDEN)

      if (!account || !payload.branchId)
        throw new HttpException('Phiên bản đăng nhập đã hết hạn!', HttpStatus.UNAUTHORIZED)

      if (!account.branches[0].expiryAt || account.branches[0].expiryAt < new Date())
        throw new HttpException('Đã hết thời gian sử dụng!', 430)

      request.branchId = payload.branchId
      request.deviceId = payload.deviceId
      request.accountId = account.id
      request.roles = account.roles
      request.shopId = account.branches?.[0]?.shopId

      return true
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST)
    }
  }

  private getRequest(context: ExecutionContext) {
    if (context.getType() === 'ws') {
      return context.switchToWs().getClient().handshake
    }
    return context.switchToHttp().getRequest()
  }

  private getAuthHeader(context: ExecutionContext) {
    if (context.getType() === 'ws') {
      const request = context.switchToWs().getClient().handshake
      return request.auth?.authorization
    } else {
      const request = context.switchToHttp().getRequest()
      return request.headers?.authorization
    }
  }
}

@Injectable()
export class JwtCustomerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const authHeader = request.headers.authorization

    if (!authHeader) return false

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = authHeader.split(' ')

    if (!token) throw new HttpException('Không tìm thấy token!', HttpStatus.UNAUTHORIZED)

    const payload: TokenCustomerPayload = this.jwtService.decode(token)

    request.tokenCustomerPayload = payload

    return true
  }
}
