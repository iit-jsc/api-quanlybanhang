import {
  CreateRefreshTokenDto,
  LoginForCustomerDto,
  LoginForManagerDto,
  LoginForStaffDto,
  LogoutDto,
} from "./dto/login.dto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { mapResponseLogin } from "map-responses/account.map-response";
import { CustomHttpException } from "utils/ApiErrors";
import { ACCOUNT_STATUS, ACCOUNT_TYPE } from "enums/user.enum";
import { AccessBranchDto } from "./dto/access-branch.dto";
import { AnyObject, TokenCustomerPayload, TokenPayload } from "interfaces/common.interface";
import { CommonService } from "src/common/common.service";
import { VerifyPhoneDto } from "src/shop/dto/verify-phone.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ChangeAvatarDto } from "./dto/change-information.dto";
import { TransporterService } from "src/transporter/transporter.service";
import { v4 as uuidv4 } from "uuid";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private commonService: CommonService,
    private transporterService: TransporterService,
  ) {}

  async loginForStaff(data: LoginForStaffDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        username: {
          contains: data.username,
        },
        branches: {
          some: {
            shop: {
              code: data.shopCode,
              isPublic: true,
            },
          },
        },
        type: ACCOUNT_TYPE.STAFF,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        branches: true,
      },
    });

    if (!account || !(await bcrypt.compare(data.password, account.password))) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác!");
    }

    if (account.status == ACCOUNT_STATUS.INACTIVE) {
      throw new CustomHttpException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa!");
    }

    const shops = await this.commonService.findManyShopByAccountId(account.id);

    const payload = { accountId: account.id };

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: "96h",
      }),
      shops,
    };
  }

  async loginForManager(data: LoginForManagerDto) {
    let account = null;

    if (data.password) {
      account = await this.prisma.account.findFirst({
        where: {
          isPublic: true,
          username: {
            equals: data.phone,
          },
          status: ACCOUNT_STATUS.ACTIVE,
          OR: [
            {
              type: ACCOUNT_TYPE.MANAGER,
            },
            {
              type: ACCOUNT_TYPE.STORE_OWNER,
            },
          ],
        },
      });

      if (!account || !account.password || !(await bcrypt.compare(data.password, account.password))) {
        throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác!");
      }
    }

    // if (!data.password) {
    //   account = await this.prisma.account.findFirst({
    //     where: {
    //       isPublic: true,
    //       username: {
    //         equals: data.phone,
    //       },
    //       status: ACCOUNT_STATUS.ACTIVE,
    //       OR: [
    //         {
    //           type: ACCOUNT_TYPE.MANAGER,
    //         },
    //         {
    //           type: ACCOUNT_TYPE.STORE_OWNER,
    //         },
    //       ],
    //     },
    //   });
    // }

    // if (!account)
    //   throw new CustomHttpException(
    //     HttpStatus.NOT_FOUND,
    //     "Tài khoản không tồn tại hoặc đã bị khóa!",
    //   );

    const shops = await this.commonService.findManyShopByAccountId(account.id);

    const payload = { accountId: account.id };

    return {
      accountToken: await this.jwtService.signAsync(payload, {
        expiresIn: "96h",
      }),
      shops,
    };
  }

  async loginForCustomer(data: LoginForCustomerDto) {
    await this.commonService.confirmOTP({
      code: data.code,
      phone: data.phone,
    });

    const customer = await this.prisma.customer.findFirstOrThrow({
      where: {
        phone: data.phone,
        isPublic: true,
        shop: {
          id: data.shopId,
          isPublic: true,
        },
      },
    });

    return {
      accessToken: await this.jwtService.signAsync(
        {
          customerId: customer.id,
        } as TokenCustomerPayload,
        {
          expiresIn: "96h",
        },
      ),
      customer,
    };
  }

  async accessBranch(accessBranchDto: AccessBranchDto, tokenPayload: TokenPayload, req?: AnyObject) {
    const account = await this.getAccountAccess(tokenPayload.accountId, accessBranchDto.branchId);

    if (!account) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên!");
    }

    const currentShop = await this.getCurrentShop(accessBranchDto.branchId);

    const shops = await this.commonService.findManyShopByAccountId(account.id);

    // Lưu thông tin thiết bị
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const userAgent = req.headers["user-agent"];

    const deviceId = uuidv4();

    const refreshToken = await this.createRefreshToken({
      accountId: account.id,
      branchId: accessBranchDto.branchId,
      deviceId: deviceId,
      ip,
      userAgent,
      lastLogin: new Date(),
    });

    return {
      accessToken: await this.jwtService.signAsync(
        {
          accountId: tokenPayload.accountId,
          branchId: accessBranchDto.branchId,
        } as TokenPayload,
        {
          expiresIn: "96h",
        },
      ),
      refreshToken,
      ...mapResponseLogin({ account, shops, currentShop }),
    };
  }

  async verifyPhone(data: VerifyPhoneDto) {
    const otp = (Math.floor(Math.random() * 900000) + 100000).toString();

    let user = null;

    if (data.isCustomer) {
      user = await this.prisma.customer.findFirst({
        where: { phone: data.phone, email: { not: null } },
        select: { id: true, email: true },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: { email: { not: null }, account: { username: data.phone } },
        select: { id: true, email: true },
      });
    }

    await this.transporterService.sendOTP(user?.email, otp);

    await this.prisma.phoneVerification.create({
      data: { code: otp, phone: data.phone },
    });

    return user.email;
  }

  async checkValidSession() {}

  async getMe(token: string) {
    if (!token) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tim thấy token!");

    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      })) as TokenPayload;

      const shops = await this.commonService.findManyShopByAccountId(payload.accountId);

      const account = await this.getAccountAccess(payload.accountId, payload.branchId);

      const currentShop = await this.getCurrentShop(payload.branchId);

      if (!account) {
        throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên!");
      }

      return { ...mapResponseLogin({ account, shops, currentShop }) };
    } catch (error) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, error);
    }
  }

  async getCurrentShop(branchId: string) {
    if (!branchId) return undefined;

    return await this.prisma.shop.findFirst({
      where: {
        isPublic: true,
        branches: {
          some: { id: branchId, isPublic: true },
        },
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
          },
          where: {
            isPublic: true,
            id: branchId,
          },
        },
        businessType: {
          where: {
            isPublic: true,
          },
        },
      },
    });
  }

  async getAccountAccess(accountId: string, branchId: string) {
    return await this.prisma.account.findUnique({
      where: {
        id: accountId,
        isPublic: true,
        status: ACCOUNT_STATUS.ACTIVE,
        branches: {
          some: {
            id: branchId,
            isPublic: true,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            code: true,
            photoURL: true,
            phone: true,
            email: true,
          },
        },
        permissions: {
          where: { isPublic: true },
          include: {
            roles: true,
          },
        },
      },
    });
  }

  async changePassword(data: ChangePasswordDto, tokenPayload: TokenPayload) {
    return await this.prisma.account.update({
      where: {
        id: tokenPayload.accountId,
      },
      data: {
        password: bcrypt.hashSync(data.newPassword, 10),
      },
    });
  }

  async changeInformation(data: ChangeAvatarDto, tokenPayload: TokenPayload) {
    const user = await this.prisma.user.findFirst({
      where: {
        isPublic: true,
        account: {
          id: tokenPayload.accountId,
        },
      },
    });

    return this.prisma.user.update({
      data: { photoURL: data.photoURL },
      where: {
        id: user.id,
        isPublic: true,
      },
    });
  }

  async createRefreshToken(data: CreateRefreshTokenDto) {
    // Tạo refresh token
    const refreshToken = await this.jwtService.signAsync(
      {
        accountId: data.accountId,
        branchId: data.branchId,
        deviceId: data.deviceId,
        ip: data.ip,
        userAgent: data.userAgent,
        lastLogin: data.lastLogin,
      } as TokenPayload,
      {
        expiresIn: "30d",
      },
    );

    await this.prisma.authToken.create({
      data: {
        accountId: data.accountId,
        deviceId: data.deviceId,
        refreshToken,
      },
    });

    return refreshToken;
  }

  async logout(logoutDto: LogoutDto, tokenPayload: TokenPayload) {
    if (logoutDto.isAllDevices)
      return this.prisma.authToken.deleteMany({ where: { accountId: tokenPayload.accountId } });

    return this.prisma.authToken.delete({ where: { deviceId: tokenPayload.deviceId } });
  }
}
