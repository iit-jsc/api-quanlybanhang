// import { Injectable } from '@nestjs/common';
// import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
// import { TokenPayload } from 'interfaces/common.interface';
// import { Prisma } from '@prisma/client';
// import { calculatePagination } from 'utils/Helps';
// import { FindManyDto } from 'utils/Common.dto';
// import { PrismaService } from 'nestjs-prisma';

// @Injectable()
// export class PaymentMethodService {
//   constructor(private readonly prisma: PrismaService) {}

//   async create(data: CreatePaymentMethodDto, tokenPayload: TokenPayload) {
//     return await this.prisma.paymentMethod.create({
//       data: {
//         name: data.name,
//         description: data.description,
//         status: data.status,
//         logo: data.logo,
//         createdBy: tokenPayload.accountId,
//         updatedBy: tokenPayload.accountId,
//         shop: {
//           connect: {
//             id: tokenPayload.shopId,
//           },
//         },
//       },
//     });
//   }

//   async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
//     let { skip, take, keyword } = params;
//     let where: Prisma.PaymentMethodWhereInput = {
//       isPublic: true,
//       ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
//       shop: {
//         id: tokenPayload.shopId,
//         isPublic: true,
//       },
//     };
//     const [data, totalRecords] = await Promise.all([
//       this.prisma.paymentMethod.findMany({
//         skip,
//         take,
//         orderBy: {
//           createdAt: 'desc',
//         },
//         where,
//         select: {
//           id: true,
//           name: true,
//           description: true,
//           logo: true,
//           status: true,
//           updatedAt: true,
//         },
//       }),
//       this.prisma.paymentMethod.count({
//         where,
//       }),
//     ]);
//     return {
//       list: data,
//       pagination: calculatePagination(totalRecords, skip, take),
//     };
//   }

//   async findUniq(
//     where: Prisma.PaymentMethodWhereUniqueInput,
//     tokenPayload: TokenPayload,
//   ) {
//     return this.prisma.paymentMethod.findUniqueOrThrow({
//       where: {
//         ...where,
//         isPublic: true,
//         shop: {
//           id: tokenPayload.shopId,
//           isPublic: true,
//         },
//       },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         logo: true,
//         status: true,
//         updatedAt: true,
//       },
//     });
//   }

//   async update(
//     params: {
//       where: Prisma.PaymentMethodWhereUniqueInput;
//       data: CreatePaymentMethodDto;
//     },
//     tokenPayload: TokenPayload,
//   ) {
//     const { where, data } = params;
//     return this.prisma.paymentMethod.update({
//       where: {
//         id: where.id,
//         isPublic: true,
//         shop: {
//           id: tokenPayload.shopId,
//           isPublic: true,
//         },
//       },
//       data: {
//         name: data.name,
//         description: data.description,
//         status: data.status,
//         logo: data.logo,
//         updatedBy: tokenPayload.accountId,
//       },
//     });
//   }

//   async removeMany(
//     where: Prisma.PaymentMethodWhereInput,
//     tokenPayload: TokenPayload,
//   ) {
//     return this.prisma.paymentMethod.updateMany({
//       where: {
//         ...where,
//         isPublic: true,
//         shop: {
//           id: tokenPayload.shopId,
//           isPublic: true,
//         },
//       },
//       data: {
//         isPublic: false,
//         updatedBy: tokenPayload.accountId,
//       },
//     });
//   }
// }
