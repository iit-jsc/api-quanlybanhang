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
    const requiredRoleCodes = this.reflector.get<string[]>('roles', context.getHandler());

    const request = context.switchToHttp().getRequest();

    const tokenPayload = request.tokenPayload as TokenPayload;

    const allRoles = request.permissions?.map(permission => permission.roles).flat() || [];

    const userRoleCodes = allRoles?.map(role => role.code);

    if (requiredRoleCodes.some((role) => role === SPECIAL_ROLE.STORE_OWNER)
      && tokenPayload.type === ACCOUNT_TYPE.STORE_OWNER)
      return true

    if (requiredRoleCodes.some((role) => role === SPECIAL_ROLE.MANAGER)
      && tokenPayload.type !== ACCOUNT_TYPE.STAFF)
      return true

    return requiredRoleCodes.some((requiredCode) =>
      userRoleCodes.some((code) => code === requiredCode),
    )
  }
}
