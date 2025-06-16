import { Injectable } from '@nestjs/common'
import {
  CancelOrderDetailsDto,
  FindManyOrderDetailDto,
  UpdateOrderDetailDto,
  UpdateStatusOrderDetailsDto
} from './dto/order-detail.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { OrderDetailCrudService } from './services/order-detail-crud.service'
import { OrderDetailStatusService } from './services/order-detail-status.service'
import { OrderDetailOperationsService } from './services/order-detail-operations.service'

@Injectable()
export class OrderDetailService {
  constructor(
    private readonly orderDetailCrudService: OrderDetailCrudService,
    private readonly orderDetailStatusService: OrderDetailStatusService,
    private readonly orderDetailOperationsService: OrderDetailOperationsService
  ) {}

  // CRUD Operations
  async findAll(params: FindManyOrderDetailDto, branchId: string) {
    return this.orderDetailCrudService.findAll(params, branchId)
  }

  async update(
    id: string,
    data: UpdateOrderDetailDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.orderDetailCrudService.update(id, data, accountId, branchId, deviceId)
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string, deviceId: string) {
    return this.orderDetailCrudService.deleteMany(data, accountId, branchId, deviceId)
  }

  async checkOrderPaidByDetailIds(orderDetailIds: string[]) {
    return this.orderDetailCrudService.checkOrderPaidByDetailIds(orderDetailIds)
  }

  // Status Management
  async updateStatusOrderDetails(
    data: UpdateStatusOrderDetailsDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.orderDetailStatusService.updateStatusOrderDetails(
      data,
      accountId,
      branchId,
      deviceId
    )
  }

  // Operations
  async cancel(
    id: string,
    data: CancelOrderDetailsDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.orderDetailOperationsService.cancel(id, data, accountId, branchId, deviceId)
  }
}
