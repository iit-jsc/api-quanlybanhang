// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ACCOUNT_TYPE } from 'enums/user.enum';
// import { TokenPayload } from 'interfaces/common.interface';
// import { PrismaService } from 'nestjs-prisma';

// @Injectable()
// export class BranchGuard implements CanActivate {
//   constructor(private prisma: PrismaService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const tokenPayload = request.tokenPayload as TokenPayload;
//     const branchIds = request.body.branchIds || [];

//     if (new Set(branchIds).size !== branchIds.length) {
//       throw new UnauthorizedException(
//         'Danh sách chi nhánh không được chứa giá trị trùng lặp!',
//       );
//     }

//     if (tokenPayload.type !== ACCOUNT_TYPE.STORE_OWNER) {
//       const branches = await this.prisma.branch.findMany({
//         where: {
//           isPublic: true,
//           id: {
//             in: branchIds,
//           },
//           users: {
//             some: {
//               accounts: {
//                 some: {
//                   id: tokenPayload.accountId,
//                 },
//               },
//             },
//           },
//         },
//       });

//       if (branches.length !== branchIds.length)
//         throw new UnauthorizedException(
//           'Chi nhánh không tồn tại!',
//         );
//     }

//     const branches = await this.prisma.branch.findMany({
//       where: {
//         id: {
//           in: branchIds,
//         },
//         isPublic: true,
//         shop: {
//           id: tokenPayload.shopId,
//           isPublic: true,
//         },
//       },
//     });

//     if (branches.length !== branchIds.length)
//       throw new UnauthorizedException(
//         'Chi nhánh không thuộc cửa hàng!',
//       );

//     return true;
//   }
// }
