import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateCustomerRequestDto, UpdateCustomerRequestDto } from './dto/customer-request.dto';
import { DeleteManyResponse, TokenPayload } from 'interfaces/common.interface';
import { Prisma } from '@prisma/client';
import { calculatePagination } from 'utils/Helps';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { CustomerRequestGateway } from 'src/gateway/customer-request.gateway';

@Injectable()
export class CustomerRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerRequestGateway: CustomerRequestGateway,
  ) { }

  async create(data: CreateCustomerRequestDto) {
    const customerRequest = await this.prisma.customerRequest.create({
      data: {
        content: data.content,
        tableId: data.tableId,
        branchId: data.branchId,
        requestType: data.requestType,
      },
      include: {
        table: true,
      },
    });

    // Gửi socket
    await this.customerRequestGateway.handleCreateCustomerRequest(customerRequest);

    return customerRequest
  }


  async update(
    params: { data: UpdateCustomerRequestDto; where: Prisma.CustomerRequestWhereUniqueInput },
    tokenPayload: TokenPayload,
  ) {
    const { data, where } = params;

    return this.prisma.customerRequest.update({
      data: {
        content: data.content,
        tableId: data.tableId,
        requestType: data.requestType,
        isCompleted: data.isCompleted,
        updatedBy: tokenPayload.accountId
      },
      where: {
        id: where.id,
        branchId: tokenPayload.branchId,
      }
    });
  }

  async findAll(params: FindManyDto, tokenPayload: TokenPayload) {
    let { skip, take, orderBy } = params;

    let where: Prisma.CustomerRequestWhereInput = {
      isPublic: true,
      branchId: tokenPayload.branchId
    };

    const [data, totalRecords] = await Promise.all([
      this.prisma.customerRequest.findMany({
        skip,
        take,
        orderBy: orderBy || { createdAt: "desc" },
        where,
        include: {
          updater: {
            select: {
              id: true,
              username: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  photoURL: true,
                  phone: true
                }
              }
            },
          },
          table: true
        }
      }),
      this.prisma.customerRequest.count({
        where,
      }),
    ]);

    return {
      list: data,
      pagination: calculatePagination(totalRecords, skip, take),
    };
  }

  async findUniq(where: Prisma.CustomerRequestWhereUniqueInput, tokenPayload: TokenPayload) {
    return this.prisma.customerRequest.findUniqueOrThrow({
      where: {
        ...where,
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      include: {
        updater: {
          select: {
            id: true,
            username: true,
            user: {
              select: {
                id: true,
                name: true,
                photoURL: true,
                phone: true
              }
            }
          },
        },
        table: true
      }
    });
  }

  async deleteMany(data: DeleteManyDto, tokenPayload: TokenPayload) {
    const count = await this.prisma.customerRequest.updateMany({
      where: {
        id: {
          in: data.ids,
        },
        isPublic: true,
        branchId: tokenPayload.branchId,
      },
      data: {
        isPublic: false,
        updatedBy: tokenPayload.accountId,
      },
    });

    return { ...count, ids: data.ids } as DeleteManyResponse;
  }
}
