import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
    const request = context.switchToHttp().getRequest()

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const permissionsInRole = request.roles
      ?.map(role => role.permissions)
      ?.flat()
      ?.map(permission => permission.code)
      ?.filter(code => requiredRoles.includes(code))

    return permissionsInRole.length > 0
  }
}
