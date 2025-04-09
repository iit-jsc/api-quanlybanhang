import { ActivityAction, NotifyType, Prisma, PrismaClient, RequestStatus } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CustomerRequestGateway } from 'src/gateway/customer-request.gateway'
import {
  CreateCustomerRequestDto,
  FindManyCustomerRequestDto,
  UpdateCustomerRequestDto
} from './dto/customer-request.dto'
import { customerRequestSelect } from 'responses/customer-request.response'
import { customPaginate, generateCode, removeDiacritics } from 'utils/Helps'
import { CreateManyTrashDto } from 'src/trash/dto/trash.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { TrashService } from 'src/trash/trash.service'
import { NotifyService } from 'src/notify/notify.service'
import { ActivityLogService } from 'src/activity-log/activity-log.service'

@Injectable()
export class CustomerRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerRequestGateway: CustomerRequestGateway,
    private readonly trashService: TrashService,
    private readonly notifyService: NotifyService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async create(data: CreateCustomerRequestDto) {
    return this.prisma.$transaction(async prisma => {
      const customerRequest = await prisma.customerRequest.create({
        data: {
          code: generateCode('YC'),
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
    })
  }

  async update(id: string, data: UpdateCustomerRequestDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const customerRequest = await prisma.customerRequest.update({
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

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'CustomerRequest',
          targetId: customerRequest.id,
          targetName: customerRequest.code
        },
        { branchId, prisma },
        accountId
      )

      return customerRequest
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
      const entities = await prisma.customerRequest.findMany({
        where: { id: { in: data.ids } }
      })

      const dataTrash: CreateManyTrashDto = {
        accountId,
        modelName: 'CustomerRequest',
        entities
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
