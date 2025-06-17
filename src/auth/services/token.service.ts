import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import { TokenPayload } from 'interfaces/common.interface'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createAccountToken(accountId: string): Promise<string> {
    return await this.jwtService.signAsync(
      { accountId },
      {
        expiresIn: process.env.EXPIRES_IN_ACCOUNT_TOKEN,
        secret: process.env.SECRET_KEY
      }
    )
  }

  async createAccessToken(accountId: string, branchId: string, deviceId?: string): Promise<string> {
    const payload: any = { accountId, branchId }
    if (deviceId) payload.deviceId = deviceId

    return await this.jwtService.signAsync(payload, {
      expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
      secret: process.env.SECRET_KEY
    })
  }

  async createRefreshToken(accountId: string, branchId: string): Promise<string> {
    return await this.jwtService.signAsync(
      { accountId, branchId },
      {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN,
        secret: process.env.SECRET_KEY
      }
    )
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.SECRET_KEY
    })
  }

  generateDeviceId(): string {
    return uuidv4()
  }

  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh-token'
    })
  }
}
