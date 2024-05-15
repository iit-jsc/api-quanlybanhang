import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { USER_TYPE } from 'enums/user.enum';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class BranchGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenPayload = request.tokenPayload as TokenPayload;
    const branchIds = request.body.branchIds || [];

    const branches = await this.prisma.branch.findMany({
      where: {
        id: {
          in: branchIds,
        },
        isPublic: true,
        shop: {
          id: tokenPayload.shopId,
          isPublic: true,
        },
      },
    });

    if (branches.length !== branchIds.length)
      throw new UnauthorizedException('Chi nhánh không thuộc cửa hàng!');

    return true;
  }
}
