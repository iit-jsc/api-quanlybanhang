import { extname } from 'path'
import * as bcrypt from 'bcrypt'
import { LoginForCustomerDto, LoginDto } from './dto/login.dto'
import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { JwtService } from '@nestjs/jwt'
import { mapResponseLogin } from 'map-responses/account.map-response'
import { CustomHttpException } from 'utils/ApiErrors'
import { ACCOUNT_STATUS } from 'enums/user.enum'
import { AccessBranchDto } from './dto/access-branch.dto'
import {
  AnyObject,
  TokenCustomerPayload,
  TokenPayload
} from 'interfaces/common.interface'
import { CommonService } from 'src/common/common.service'
import { VerifyContactDto } from 'src/shop/dto/verify-contact.dto'
import {
  ChangeMyPasswordDto,
  ChangePasswordDto
} from './dto/change-password.dto'
import { ChangeAvatarDto } from './dto/change-information.dto'
import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import { AccountStatus } from '@prisma/client'
import { userSortSelect } from 'responses/user.response'
import { roleSortSelect } from 'responses/role.response'
import { accountSortSelect } from 'responses/account.response'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private commonService: CommonService
  ) {}

  async login(data: LoginDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        user: {
          OR: [
            {
              phone: data.username
            },
            {
              email: data.username
            }
          ]
        }
      },
      select: accountSortSelect
    })

    if (!account || !(await bcrypt.compare(data.password, account.password)))
      throw new HttpException(
        `Tài khoản hoặc mật khẩu không chính xác!`,
        HttpStatus.UNAUTHORIZED
      )

    if (account.status == AccountStatus.INACTIVE)
      throw new HttpException(`Tài khoản đã bị khóa!`, HttpStatus.FORBIDDEN)

    const shops = await this.commonService.findManyShopByAccountId(account.id)

    const payload = { accountId: account.id }

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: process.env.EXPIRES_IN_ACCOUNT_TOKEN,
        secret: process.env.SECRET_KEY
      }),
      shops
    }
  }

  async loginForCustomer(data: LoginForCustomerDto) {
    await this.commonService.confirmOTP({
      otp: data.otp,
      email: data.email
    })

    const customer = await this.prisma.customer.findFirstOrThrow({
      where: {
        email: data.email,
        shopId: data.shopId
      }
    })

    return {
      accessToken: await this.jwtService.signAsync(
        {
          customerId: customer.id
        } as TokenCustomerPayload,
        {
          expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
          secret: process.env.SECRET_KEY
        }
      ),
      customer
    }
  }

  async accessBranch(
    accessBranchDto: AccessBranchDto,
    tokenPayload: TokenPayload,
    res: Response,
    req?: AnyObject
  ) {
    // const account = await this.getAccountAccess(
    //   tokenPayload.accountId,
    //   accessBranchDto.branchId
    // )
    // if (!account) {
    //   throw new CustomHttpException(
    //     HttpStatus.NOT_FOUND,
    //     'Không tìm thấy tài nguyên!'
    //   )
    // }
    // const currentShop = await this.getCurrentShop(accessBranchDto.branchId)
    // const shops = await this.commonService.findManyShopByAccountId(account.id)
    // const data = await this.createRefreshTokenAndDevice(
    //   account.id,
    //   accessBranchDto,
    //   tokenPayload.deviceId,
    //   req
    // )
    // res.cookie('refreshToken', data.refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    //   path: '/api/auth/refresh-token'
    // })
    // return {
    //   accessToken: await this.jwtService.signAsync(
    //     {
    //       accountId: tokenPayload.accountId,
    //       branchId: accessBranchDto.branchId,
    //       deviceId: data.deviceId
    //     } as TokenPayload,
    //     {
    //       expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
    //       secret: process.env.SECRET_KEY
    //     }
    //   ),
    //   refreshToken: data.refreshToken,
    //   ...mapResponseLogin({ account, shops, currentShop })
    // }
  }

  async verifyContact(data: VerifyContactDto) {
    // const otp = (Math.floor(Math.random() * 900000) + 100000).toString();
    // const user = await this.prisma.customer.findUnique({
    //   where: {
    //     isPublic: true,
    //     ...(data.phone && {
    //       shopId_phone: {
    //         shopId: data.shopId,
    //         phone: data.phone
    //       }
    //     }),
    //   },
    //   select: { id: true, email: true },
    // });
    // if (!user) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin người dùng!");
    // await this.transporterService.sendOTP(user?.email, otp);
    // await this.prisma.contactVerification.create({
    //   data: {
    //     otp,
    //     ...(data.phone && { phone: data.phone }),
    //     ...(data.email && { email: data.email }),
    //   },
    // });
    // return data.email ? { email: user.email } : { email: this.maskEmail(user.email) };
  }

  maskEmail(email: string) {
    const [localPart, domain] = email.split('@')

    if (localPart.length <= 2) {
      return email
    }

    const maskedLocalPart =
      localPart[0] +
      '*'.repeat(localPart.length - 2) +
      localPart[localPart.length - 1]

    return maskedLocalPart + '@' + domain
  }

  async checkValidDeviceAndUpdateLastLogin(deviceId: string) {
    try {
      // await this.prisma.authToken.update({
      //   where: { deviceId: deviceId },
      //   data: { lastLogin: new Date() }
      // })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new CustomHttpException(
          HttpStatus.UNAUTHORIZED,
          'Phiên bản đăng nhập đã hết hạn!'
        )
      }
      throw error
    }
  }

  async getMe(token: string) {
    if (!token)
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Không tìm thấy token!'
      )

    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY
      })

      // Nếu đã truy cập vào chi nhánh thì kiểm tra có device hay không

      if (payload.branchId)
        await this.checkValidDeviceAndUpdateLastLogin(payload.deviceId)

      const shops = await this.commonService.findManyShopByAccountId(
        payload.accountId
      )

      const account = await this.getAccountAccess(
        payload.accountId,
        payload.branchId
      )

      const currentShop = await this.getCurrentShop(payload.branchId)

      if (!account) {
        throw new CustomHttpException(
          HttpStatus.NOT_FOUND,
          'Không tìm thấy tài nguyên!'
        )
      }

      // return { ...mapResponseLogin({ account, shops, currentShop }) }
    } catch (error) {
      throw new CustomHttpException(
        HttpStatus.UNAUTHORIZED,
        'Phiên bản đăng nhập hết hạn!'
      )
    }
  }

  async getCurrentShop(branchId: string) {
    if (!branchId) return undefined

    return await this.prisma.shop.findFirst({
      where: {
        branches: {
          some: { id: branchId }
        }
      },
      select: {
        id: true,
        name: true,
        code: true,
        photoURL: true,
        address: true,
        email: true,
        phone: true,
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            photoURL: true,
            bannerURL: true
          }
        },
        businessType: true
      }
    })
  }

  async getAccountAccess(accountId: string, branchId: string) {
    return await this.prisma.account.findUnique({
      where: {
        id: accountId,
        status: AccountStatus.ACTIVE,
        branches: {
          some: {
            id: branchId
          }
        }
      },
      select: {
        id: true,
        user: {
          select: userSortSelect
        },
        role: {
          select: roleSortSelect
        }
      }
    })
  }

  async changePassword(data: ChangePasswordDto, tokenPayload: TokenPayload) {
    return await this.prisma.account.update({
      where: {
        id: tokenPayload.accountId
      },
      data: {
        password: bcrypt.hashSync(data.newPassword, 10)
      }
    })
  }

  async changeMyPassword(
    data: ChangeMyPasswordDto,
    tokenPayload: TokenPayload
  ) {
    // const account = await this.prisma.account.findFirst({
    //   where: {
    //     id: tokenPayload.accountId
    //   }
    // })
    // if (!account || !bcrypt.compareSync(data.oldPassword, account.password))
    //   throw new CustomHttpException(
    //     HttpStatus.CONFLICT,
    //     'Mật khẩu cũ không chính xác!'
    //   )
    // if (data.isLoggedOutAll)
    //   await this.prisma.authToken.deleteMany({
    //     where: {
    //       accountId: tokenPayload.accountId,
    //       deviceId: {
    //         not: tokenPayload.deviceId
    //       }
    //     }
    //   })
    // return await this.prisma.account.update({
    //   where: {
    //     id: tokenPayload.accountId
    //   },
    //   data: {
    //     password: bcrypt.hashSync(data.newPassword, 10)
    //   }
    // })
  }

  async changeInformation(data: ChangeAvatarDto, tokenPayload: TokenPayload) {
    const user = await this.prisma.user.findFirst({
      where: {
        account: {
          id: tokenPayload.accountId
        }
      }
    })

    return this.prisma.user.update({
      data: { photoURL: data.photoURL },
      where: {
        id: user.id
      }
    })
  }

  async createRefreshTokenAndDevice(
    accountId: string,
    accessBranchDto: AccessBranchDto,
    deviceId: string,
    req: AnyObject
  ) {
    // Lưu thông tin thiết bị
    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    // const userAgent = req.headers['user-agent']
    // const validDeviceId = deviceId || uuidv4()
    // // Tạo refresh token
    // const refreshToken = await this.jwtService.signAsync(
    //   {
    //     accountId: accountId,
    //     branchId: accessBranchDto.branchId,
    //     deviceId: validDeviceId
    //   },
    //   {
    //     expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN,
    //     secret: process.env.SECRET_KEY
    //   }
    // )
    // return await this.prisma.authToken.upsert({
    //   where: { deviceId: validDeviceId },
    //   create: {
    //     accountId: accountId,
    //     deviceId: validDeviceId,
    //     firebaseToken: accessBranchDto.firebaseToken,
    //     refreshToken,
    //     ip: ip,
    //     userAgent: userAgent,
    //     lastLogin: new Date()
    //   },
    //   update: { refreshToken }
    // })
  }

  async logout(tokenPayload: TokenPayload) {
    // return this.prisma.authToken.deleteMany({
    //   where: {
    //     deviceId: tokenPayload.deviceId
    //   }
    // })
  }

  async getDevice(tokenPayload: TokenPayload) {
    // return this.prisma.authToken.findMany({
    //   where: { accountId: tokenPayload.accountId },
    //   select: {
    //     ip: true,
    //     deviceId: true,
    //     lastLogin: true,
    //     userAgent: true
    //   }
    // })
  }

  async refreshToken(refreshToken: string) {
    // const device = await this.prisma.authToken.findFirst({
    //   where: { refreshToken }
    // })
    // if (!refreshToken || !device)
    //   throw new CustomHttpException(
    //     HttpStatus.NOT_FOUND,
    //     'Không tìm thấy token hoặc đã hết hạn!'
    //   )
    // try {
    //   const payload: TokenPayload = await this.jwtService.verifyAsync(
    //     refreshToken,
    //     {
    //       secret: process.env.SECRET_KEY
    //     }
    //   )
    //   // Nếu đã truy cập vào chi nhánh thì kiểm tra có device hay không
    //   if (payload.branchId)
    //     await this.checkValidDeviceAndUpdateLastLogin(payload.deviceId)
    //   const shops = await this.commonService.findManyShopByAccountId(
    //     payload.accountId
    //   )
    //   const account = await this.getAccountAccess(
    //     payload.accountId,
    //     payload.branchId
    //   )
    //   const currentShop = await this.getCurrentShop(payload.branchId)
    //   if (!account) {
    //     throw new CustomHttpException(
    //       HttpStatus.NOT_FOUND,
    //       'Không tìm thấy tài nguyên!'
    //     )
    //   }
    //   return {
    //     accessToken: await this.jwtService.signAsync(
    //       {
    //         accountId: payload.accountId,
    //         branchId: payload.branchId,
    //         deviceId: payload.deviceId
    //       } as TokenPayload,
    //       {
    //         expiresIn: process.env.EXPIRES_IN_ACCESS_TOKEN,
    //         secret: process.env.SECRET_KEY
    //       }
    //     ),
    //     ...mapResponseLogin({ account, shops, currentShop })
    //   }
    // } catch (error) {
    //   // console.log(error);
    //   throw error
    // }
  }
}
