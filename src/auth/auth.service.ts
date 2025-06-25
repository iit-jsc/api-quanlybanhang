import { Response } from 'express'
import { Injectable } from '@nestjs/common'
import { HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { LoginDto } from './dto/login.dto'
import { mapResponseLogin } from 'map-responses/account.map-response'
import { TokenPayload } from 'interfaces/common.interface'
import { AccessBranchDto } from './dto/access-branch.dto'
import { accountLoginSelect } from 'responses/account.response'
import { ChangeMyPasswordDto } from './dto/change-password.dto'
import { RegisterDto } from './dto/register.dto'
import { TokenService } from './services/token.service'
import { PasswordService } from './services/password.service'
import { AccountAccessService } from './services/account-access.service'
import { RegistrationService } from './services/registration.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly accountAccessService: AccountAccessService,
    private readonly registrationService: RegistrationService
  ) {}
  async login(data: LoginDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        user: {
          OR: [{ phone: data.username }, { email: data.username }]
        }
      },
      select: accountLoginSelect
    })

    if (!account || !this.passwordService.comparePassword(data.password, account.password)) {
      throw new HttpException('Tài khoản hoặc mật khẩu không chính xác!', HttpStatus.UNAUTHORIZED)
    }

    this.accountAccessService.validateAccountStatus(account)

    const shops = await this.accountAccessService.getShopsByAccountId(account.id)

    return {
      accountToken: await this.tokenService.createAccountToken(account.id),
      shops
    }
  }

  async accessBranch(accountId: string, data: AccessBranchDto, res: Response) {
    const account = await this.accountAccessService.getAccountAccess(accountId, data.branchId)
    this.accountAccessService.validateAccountExists(account)

    const [shops, refreshToken] = await Promise.all([
      this.accountAccessService.getShopsByAccountId(accountId),
      this.tokenService.createRefreshToken(accountId, data.branchId)
    ])

    const currentShop = this.accountAccessService.getCurrentShopFromShops(shops, data.branchId)
    this.accountAccessService.validateBranchExpiry(currentShop)

    this.tokenService.setRefreshTokenCookie(res, refreshToken)

    const deviceId = this.tokenService.generateDeviceId()

    return {
      accessToken: await this.tokenService.createAccessToken(accountId, data.branchId, deviceId),
      ...mapResponseLogin({ account, shops, currentShop })
    }
  }

  async getMe(token: string) {
    try {
      const payload: TokenPayload = await this.tokenService.verifyToken(token)

      const shops = await this.accountAccessService.getShopsByAccountId(payload.accountId)
      const currentShop = this.accountAccessService.getCurrentShopFromShops(shops, payload.branchId)
      const account = await this.accountAccessService.getAccountAccess(
        payload.accountId,
        payload.branchId
      )

      this.accountAccessService.validateAccountStatus(account)
      this.accountAccessService.validateAccountExists(account)

      return { ...mapResponseLogin({ account, shops, currentShop }) }
    } catch (error) {
      throw new HttpException('Phiên bản đăng nhập hết hạn!', HttpStatus.UNAUTHORIZED)
    }
  }

  async changeMyPassword(data: ChangeMyPasswordDto, accountId: string) {
    return await this.passwordService.changePassword(data, accountId)
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Không tìm thấy token hoặc đã hết hạn!', HttpStatus.NOT_FOUND)
    }

    try {
      const payload: TokenPayload = await this.tokenService.verifyToken(refreshToken)

      const shops = await this.accountAccessService.getShopsByAccountId(payload.accountId)
      const currentShop = this.accountAccessService.getCurrentShopFromShops(shops, payload.branchId)
      const account = await this.accountAccessService.getAccountAccess(
        payload.accountId,
        payload.branchId
      )

      const accessToken = await this.tokenService.createAccessToken(
        payload.accountId,
        payload.branchId
      )

      this.accountAccessService.validateAccountExists(account)

      return { ...mapResponseLogin({ account, shops, currentShop }), accessToken }
    } catch (error) {
      throw error
    }
  }

  async logout(deviceId: string) {
    await this.accountAccessService.deleteAccountSocket(deviceId)
    return
  }

  async register(data: RegisterDto) {
    return await this.registrationService.registerUser(data)
  }
}
