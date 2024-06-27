// const account = await this.prisma.account.findUnique({
//     where: {
//       id: payload.accountId,
//       isPublic: true,
//       status: ACCOUNT_STATUS.ACTIVE,
//       branches: {
//         some: {
//           id: payload.branchId,
//           isPublic: true,
//         },
//       },
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           code: true,
//           photoURL: true,
//           phone: true,
//           email: true,
//         },
//       },
//       permissions: {
//         where: { isPublic: true },
//         include: {
//           roles: true,
//         },
//       },
//     },
//   });
