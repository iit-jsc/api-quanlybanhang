import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CustomerRequestGateway } from 'src/gateway/customer-request.gateway'
import {
  CreateCustomerRequestDto,
  FindManyCustomerRequestDto,
  UpdateCustomerRequestDto
} from './dto/customer-request.dto'
import { NotifyType, Prisma, PrismaClient, RequestStatus } from '@prisma/client'
import { customerRequestSelect } from 'responses/customer-request.response'
import { customPaginate, removeDiacritics } from 'utils/Helps'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { NotifyService } from 'src/notify/notify.service'

@Injectable()
export class CustomerRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerRequestGateway: CustomerRequestGateway,
    private readonly trashService: TrashService,
    private readonly notifyService: NotifyService
  ) {}

  async create(data: CreateCustomerRequestDto) {
    const customerRequest = await this.prisma.customerRequest.create({
      data: {
        content: data.content,
        tableId: data.tableId,
        branchId: data.branchId,
        requestType: data.requestType,
        status: RequestStatus.PENDING
      },
      select: customerRequestSelect
    })

    // Gửi socket và thông báo
    setImmediate(() => {
      this.customerRequestGateway.handleCreateCustomerRequest(customerRequest)
      this.notifyService.create({
        type: NotifyType.NEW_CUSTOMER_REQUEST,
        branchId: data.branchId,
        customerRequestId: customerRequest.id
      })
    })

    return customerRequest
  }

  async update(id: string, data: UpdateCustomerRequestDto, accountId: string, branchId: string) {
    return this.prisma.customerRequest.update({
      data: {
        content: data.content,
        tableId: data.tableId,
        requestType: data.requestType,
        status: data.status,
        updatedBy: accountId
      },
      where: {
        id,
        branchId: branchId
      },
      select: customerRequestSelect
    })
  }

  async findAll(params: FindManyCustomerRequestDto, branchId: string) {
    const { page, perPage, orderBy, keyword, tableIds, requestTypes, statuses } = params

    const keySearch = ['content']

    const where: Prisma.CustomerRequestWhereInput = {
      branchId: branchId,
      ...(keyword && {
        OR: keySearch.map(key => ({
          [key]: { contains: removeDiacritics(keyword) }
        }))
      }),
      ...(tableIds && {
        table: {
          id: { in: tableIds }
        }
      }),
      ...(requestTypes && {
        requestType: {
          in: requestTypes
        }
      }),
      ...(statuses && {
        status: {
          in: statuses
        }
      })
    }

    return await customPaginate(
      this.prisma.customerRequest,
      {
        orderBy: orderBy || { createdAt: 'desc' },
        where,
        select: customerRequestSelect
      },
      {
        page,
        perPage
      }
    )
  }

  async findUniq(id: string, branchId: string) {
    return this.prisma.customerRequest.findUniqueOrThrow({
      where: {
        id,
        branchId
      },
      select: customerRequestSelect
    })
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const dataTrash: CreateManyTrashDto = {
        ids: data.ids,
        accountId,
        modelName: 'CustomerRequest'
      }

      await this.trashService.createMany(dataTrash, prisma)

      return prisma.customerRequest.deleteMany({
        where: {
          id: {
            in: data.ids
          },
          branchId
        }
      })
    })
  }
}
