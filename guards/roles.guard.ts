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

    const userRoleCodes = request.permissions?.reduce((acc, permission) => {
      return acc.concat(permission.roles.map(role => role.code));
    }, []) || [];

    const userRoleCodeSet = new Set(userRoleCodes);

    if (requiredRoleCodes.includes(SPECIAL_ROLE.STORE_OWNER) && tokenPayload.type === ACCOUNT_TYPE.STORE_OWNER) {
      return true;
    }

    if (requiredRoleCodes.includes(SPECIAL_ROLE.MANAGER) && tokenPayload.type !== ACCOUNT_TYPE.STAFF) {
      return true;
    }

    return requiredRoleCodes.some(requiredCode => userRoleCodeSet.has(requiredCode));
  }
}
