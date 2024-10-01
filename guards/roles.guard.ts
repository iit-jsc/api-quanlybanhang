import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SPECIAL_ROLE } from 'enums/common.enum';
import { ACCOUNT_TYPE } from 'enums/user.enum';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    const request = context.switchToHttp().getRequest();

    const tokenPayload = request.tokenPayload as TokenPayload;

    if (roles.some((role) => role === SPECIAL_ROLE.STORE_OWNER)
      && tokenPayload.type === ACCOUNT_TYPE.STORE_OWNER) {
      return true
    }

    if (roles.some((role) => role === SPECIAL_ROLE.MANAGER)
      && tokenPayload.type === ACCOUNT_TYPE.MANAGER) {
      return true
    }

    const accountRoles = await this.prisma.role.findMany({
      where: {
        permissions: {
          some: {
            accounts: {
              some: {
                id: tokenPayload.accountId,
                isPublic: true,
              },
            },
            isPublic: true,
          },
        },
      },
    });

    return roles.some((role) =>
      accountRoles.some((accountRole) => accountRole.code === role),
    );
  }
}
