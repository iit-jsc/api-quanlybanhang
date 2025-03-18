import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AccountStatus } from '@prisma/client'
import { TokenCustomerPayload } from 'interfaces/common.interface'
import { PrismaService } from 'nestjs-prisma'
import { CustomHttpException } from 'utils/ApiErrors'

@Injectable()
export class AccessBranchGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context)

    const authHeader = request.headers?.authorization

    if (!authHeader) return false

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = authHeader.split(' ')

    if (!token) throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Không tìm thấy token!')

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY
      })
      const account = await this.prisma.account.findUniqueOrThrow({
        where: {
          id: payload.accountId,
          status: AccountStatus.ACTIVE,
          branches: { some: { id: payload.branchId } }
        }
      })

      if (!account)
        throw new HttpException('Thông tin đăng nhập không hợp lệ!', HttpStatus.CONFLICT)

      request.accountId = account.id

      return true
    } catch (error) {
      throw new HttpException('Thông tin đăng nhập không hợp lệ!', HttpStatus.CONFLICT)
    }
  }

  private getRequest(context: ExecutionContext) {
    if (context.getType() === 'ws') {
      return context.switchToWs().getClient().handshake
    }
    return context.switchToHttp().getRequest()
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

    if (!token) throw new CustomHttpException(HttpStatus.NOT_FOUND, 'Không tìm thấy token!')

    const payload: TokenCustomerPayload = this.jwtService.decode(token)

    request.tokenCustomerPayload = payload

    return true
  }
}
