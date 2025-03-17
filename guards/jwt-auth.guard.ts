import { permission } from 'process'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { BRANCH_STATUS } from 'enums/shop.enum'
import { ACCOUNT_STATUS } from 'enums/user.enum'
import { TokenCustomerPayload, TokenPayload } from 'interfaces/common.interface'
import { PrismaService } from 'nestjs-prisma'
import { CustomHttpException } from 'utils/ApiErrors'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const request = this.getRequest(context)
    // const authHeader = this.getAuthHeader(context)
    // if (!authHeader) return false
    // const [_, token] = authHeader.split(' ')
    // if (!token)
    //   throw new CustomHttpException(
    //     HttpStatus.NOT_FOUND,
    //     'Không tìm thấy token!'
    //   )
    // try {
    //   const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
    //     secret: process.env.SECRET_KEY
    //   })
    //   const account = await this.prisma.account.findUniqueOrThrow({
    //     where: {
    //       id: payload.accountId,
    //       isPublic: true,
    //       status: ACCOUNT_STATUS.ACTIVE,
    //       branches: { some: { id: payload.branchId, isPublic: true } },
    //       authTokens: {
    //         some: {
    //           deviceId: payload.deviceId
    //         }
    //       }
    //     },
    //     select: {
    //       id: true,
    //       type: true,
    //       userId: true,
    //       branches: {
    //         select: { shopId: true, id: true },
    //         where: { id: payload.branchId }
    //       },
    //       permissions: {
    //         where: {
    //           isPublic: true
    //         },
    //         select: {
    //           roles: {
    //             select: {
    //               code: true
    //             }
    //           }
    //         }
    //       }
    //     }
    //   })
    //   if (!account || !payload.branchId || !account.branches?.[0]?.shopId)
    //     throw new CustomHttpException(
    //       HttpStatus.CONFLICT,
    //       'Phiên bản đăng nhập đã hết hạn!'
    //     )
    //   request.tokenPayload = {
    //     ...payload,
    //     type: account.type,
    //     userId: account.userId,
    //     shopId: account.branches?.[0]?.shopId,
    //     accountId: account.id
    //   } as TokenPayload
    //   request.permissions = account.permissions
    // } catch (error) {
    //   throw new CustomHttpException(
    //     HttpStatus.UNAUTHORIZED,
    //     'Phiên bản đăng nhập đã hết hạn!'
    //   )
    // }
    return await true
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

    const [_, token] = authHeader.split(' ')

    if (!token)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Không tìm thấy token!'
      )

    const payload: TokenCustomerPayload = this.jwtService.decode(token)

    request.tokenCustomerPayload = payload

    return true
  }
}
