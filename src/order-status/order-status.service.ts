import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { calculatePagination } from 'utils/Helps';
import { FindManyDto } from 'utils/Common.dto';
import { PrismaService } from 'nestjs-prisma';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';

@Injectable()
export class OrderStatusService {
  // constructor(private readonly prisma: PrismaService) {}
  // async create(data: CreateOrderStatusDto, tokenPayload: TokenPayload) {
  //   return await this.prisma.orderStatus.create({
  //     data: {
  //       name: data.name,
  //       description: data.description,
  //       businessType: {
  //         connect: {
  //           id: data.businessTypeId,
  //         },
  //       },
  //     },
  //   });
  // }
  // async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
  //   let { skip, take, keyword, businessTypeIds } = params;
  //   let where: Prisma.OrderStatusWhereInput = {
  //     isPublic: true,
  //     ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
  //     ...(businessTypeIds?.length > 0 && {
  //       businessType: {
  //         id: { in: businessTypeIds },
  //         isPublic: true,
  //       },
  //     }),
  //   };
  //   const [data, totalRecords] = await Promise.all([
  //     this.prisma.orderStatus.findMany({
  //       skip,
  //       take,
  //       where,
  //       select: {
  //         id: true,
  //         name: true,
  //         description: true,
  //       },
  //     }),
  //     this.prisma.orderStatus.count({
  //       where,
  //     }),
  //   ]);
  //   return {
  //     list: data,
  //     pagination: calculatePagination(totalRecords, skip, take),
  //   };
  // }
  // async findUniq(
  //   where: Prisma.OrderStatusWhereUniqueInput,
  //   tokenPayload: TokenPayload,
  // ) {
  //   return this.prisma.orderStatus.findUniqueOrThrow({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       description: true,
  //     },
  //   });
  // }
  // async update(
  //   params: {
  //     where: Prisma.OrderStatusWhereUniqueInput;
  //     data: CreateOrderStatusDto;
  //   },
  //   tokenPayload: TokenPayload,
  // ) {
  //   const { where, data } = params;
  //   return this.prisma.orderStatus.update({
  //     where: {
  //       id: where.id,
  //       isPublic: true,
  //     },
  //     data: {
  //       name: data.name,
  //       description: data.description,
  //       businessType: {
  //         connect: {
  //           id: data.businessTypeId,
  //         },
  //       },
  //     },
  //   });
  // }
  // async deleteMany(
  //   where: Prisma.OrderStatusWhereInput,
  //   tokenPayload: TokenPayload,
  // ) {
  //   return this.prisma.orderStatus.updateMany({
  //     where: {
  //       ...where,
  //       isPublic: true,
  //     },
  //     data: {
  //       isPublic: false,
  //     },
  //   });
  // }
}
