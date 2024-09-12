import { LoginForCustomerDto, LoginDto } from "./dto/login.dto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { mapResponseLogin } from "map-responses/account.map-response";
import { CustomHttpException } from "utils/ApiErrors";
import { ACCOUNT_STATUS } from "enums/user.enum";
import { AccessBranchDto } from "./dto/access-branch.dto";
import { AnyObject, TokenCustomerPayload, TokenPayload } from "interfaces/common.interface";
import { CommonService } from "src/common/common.service";
import { VerifyContactDto } from "src/shop/dto/verify-contact.dto";
import { ChangeMyPasswordDto, ChangePasswordDto } from "./dto/change-password.dto";
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

  async login(data: LoginDto) {
    const account = await this.prisma.account.findFirst({
      where: {
        isPublic: true,
        username: {
          contains: data.username,
        },
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
        expiresIn: "24h",
        secret: process.env.SECRET_KEY,
      }),
      shops,
    };
  }

  async loginForCustomer(data: LoginForCustomerDto) {
    await this.commonService.confirmOTP({
      code: data.code,
      email: data.email,
    });

    const customer = await this.prisma.customer.findFirstOrThrow({
      where: {
        email: data.email,
        isPublic: true,
        shop: {
          code: data.shopCode,
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
          expiresIn: "48h",
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

    const data = await this.createRefreshTokenAndDevice(
      account.id,
      accessBranchDto.branchId,
      tokenPayload.deviceId,
      req,
    );

    return {
      accessToken: await this.jwtService.signAsync(
        {
          accountId: tokenPayload.accountId,
          branchId: accessBranchDto.branchId,
          deviceId: data.deviceId,
        } as TokenPayload,
        {
          expiresIn: "48h",
        },
      ),
      refreshToken: data.refreshToken,
      ...mapResponseLogin({ account, shops, currentShop }),
    };
  }

  async verifyContact(data: VerifyContactDto) {
    const otp = (Math.floor(Math.random() * 900000) + 100000).toString();

    let user = null;

    if (data.isCustomer) {
      user = await this.prisma.customer.findFirst({
        where: {
          OR: [{ phone: data.phone }, { email: data.email }],
          email: { not: null },
          isPublic: true,
          shop: {
            code: data.shopCode,
            isPublic: true,
          },
        },
        select: { id: true, email: true },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: {
          email: { not: null },
          account: { username: data.phone },
          isPublic: true,
          branch: {
            shop: {
              code: data.shopCode,
              isPublic: true,
            },
          },
        },
        select: { id: true, email: true },
      });
    }

    if (!user) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin người dùng!");

    await this.transporterService.sendOTP(user?.email, otp);

    await this.prisma.contactVerification.create({
      data: { code: otp, ...(data.phone && { phone: data.phone }), ...(data.email && { email: data.email }) },
    });

    return user.email;
  }

  async checkValidDeviceAndUpdateLastLogin(deviceId: string) {
    try {
      await this.prisma.authToken.update({
        where: { deviceId: deviceId },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Phiên bản đăng nhập đã hết hạn!");
      }
      throw error;
    }
  }

  async getMe(token: string) {
    if (!token) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy token!");

    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });

      // Nếu đã truy cập vào chi nhánh thì kiểm tra có device hay không

      if (payload.branchId) await this.checkValidDeviceAndUpdateLastLogin(payload.deviceId);

      const shops = await this.commonService.findManyShopByAccountId(payload.accountId);

      const account = await this.getAccountAccess(payload.accountId, payload.branchId);

      const currentShop = await this.getCurrentShop(payload.branchId);

      if (!account) {
        throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên!");
      }

      return { ...mapResponseLogin({ account, shops, currentShop }) };
    } catch (error) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Phiên bản đăng nhập hết hạn!");
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
            bannerURL: true,
            others: true,
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

  async changeMyPassword(data: ChangeMyPasswordDto, tokenPayload: TokenPayload) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: tokenPayload.accountId,
      },
    });

    if (!account || !bcrypt.compareSync(data.oldPassword, account.password))
      throw new CustomHttpException(HttpStatus.CONFLICT, "Mật khẩu cũ không chính xác!");

    if (data.isLoggedOutAll)
      await this.prisma.authToken.deleteMany({
        where: {
          accountId: tokenPayload.accountId,
          deviceId: {
            not: tokenPayload.deviceId,
          },
        },
      });

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

  async createRefreshTokenAndDevice(accountId: string, branchId: string, deviceId: string, req: AnyObject) {
    // Lưu thông tin thiết bị
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const userAgent = req.headers["user-agent"];

    const validDeviceId = deviceId || uuidv4();

    // Tạo refresh token
    const refreshToken = await this.jwtService.signAsync(
      {
        accountId: accountId,
        branchId: branchId,
        deviceId: validDeviceId,
      },
      {
        expiresIn: "30d",
        secret: process.env.SECRET_KEY,
      },
    );

    return await this.prisma.authToken.upsert({
      where: { deviceId: validDeviceId },
      create: {
        accountId: accountId,
        deviceId: validDeviceId,
        refreshToken,
        ip: ip,
        userAgent: userAgent,
        lastLogin: new Date(),
      },
      update: { refreshToken },
    });
  }

  async logout(tokenPayload: TokenPayload) {
    return this.prisma.authToken.deleteMany({
      where: {
        deviceId: tokenPayload.deviceId,
      },
    });
  }

  async getDevice(tokenPayload: TokenPayload) {
    return this.prisma.authToken.findMany({
      where: { accountId: tokenPayload.accountId },
      select: {
        ip: true,
        deviceId: true,
        lastLogin: true,
        userAgent: true,
      },
    });
  }

  async refreshToken(refreshToken: string) {
    const device = await this.prisma.authToken.findFirst({ where: { refreshToken } });

    if (!refreshToken || !device)
      throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy token hoặc đã hết hạn!");

    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.SECRET_KEY,
      });

      // Nếu đã truy cập vào chi nhánh thì kiểm tra có device hay không

      if (payload.branchId) await this.checkValidDeviceAndUpdateLastLogin(payload.deviceId);

      const shops = await this.commonService.findManyShopByAccountId(payload.accountId);

      const account = await this.getAccountAccess(payload.accountId, payload.branchId);

      const currentShop = await this.getCurrentShop(payload.branchId);

      if (!account) {
        throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên!");
      }

      return {
        accessToken: await this.jwtService.signAsync(
          {
            accountId: payload.accountId,
            branchId: payload.branchId,
            deviceId: payload.deviceId,
          } as TokenPayload,
          {
            expiresIn: "48h",
          },
        ),
        ...mapResponseLogin({ account, shops, currentShop }),
      };
    } catch (error) {
      // console.log(error);
      throw error;
    }
  }
}
