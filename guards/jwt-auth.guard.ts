import { Injectable, CanActivate, ExecutionContext, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { BRANCH_STATUS } from "enums/shop.enum";
import { ACCOUNT_STATUS } from "enums/user.enum";
import { TokenCustomerPayload, TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CustomHttpException } from "utils/ApiErrors";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const authHeader = request.headers?.authorization;

    if (!authHeader) return false;

    const [_, token] = authHeader.split(" ");

    if (!token) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy token!");

    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      })) as TokenPayload;

      const account = await this.prisma.account.findUniqueOrThrow({
        where: {
          id: payload.accountId,
          isPublic: true,
          status: ACCOUNT_STATUS.ACTIVE,
          branches: { some: { id: payload.branchId, isPublic: true, status: BRANCH_STATUS.ACTIVE } },
        },
        select: {
          id: true,
          type: true,
          userId: true,
          branches: {
            select: { shopId: true, id: true },
            where: { id: payload.branchId },
          },
        },
      });

      if (!account) throw new CustomHttpException(HttpStatus.CONFLICT, "Thông tin đăng nhập không hợp lệ!");

      request.tokenPayload = {
        branchId: payload.branchId,
        type: account.type,
        userId: account.userId,
        shopId: account.branches?.[0]?.shopId,
        accountId: account.id,
      } as TokenPayload;
    } catch (error) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Token hết hạn!");
    }

    return true;
  }

  private getRequest(context: ExecutionContext) {
    if (context.getType() === "ws") {
      return context.switchToWs().getClient().handshake;
    }
    return context.switchToHttp().getRequest();
  }
}

@Injectable()
export class JwtCustomerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    const [_, token] = authHeader.split(" ");

    if (!token) throw new CustomHttpException(HttpStatus.NOT_FOUND, "Không tìm thấy token!");

    const payload: TokenCustomerPayload = this.jwtService.decode(token);

    request.tokenCustomerPayload = payload;

    return true;
  }
}
