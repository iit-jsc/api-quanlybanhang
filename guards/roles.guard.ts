import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    // const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
    // if (!requiredRoles || requiredRoles.length === 0) {
    //   return true
    // }
    // const request = context.switchToHttp().getRequest()
    // const userPermissionCodes = request.role?.permissions.map(permission => permission.code) || []
    // const hasPermission = requiredRoles.some(role => userPermissionCodes.includes(role))
    // return hasPermission
    return true
  }
}
