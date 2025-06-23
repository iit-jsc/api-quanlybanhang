import { Injectable } from '@nestjs/common'
import {
  CancelOrderDto,
  CreateOrderDto,
  FindManyOrderDto,
  SaveOrderDto,
  UpdateOrderDto
} from './dto/order.dto'
import { PaymentOrderDto, UpdatePaymentDto } from './dto/payment.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { OrderCrudService } from './services/order-crud.service'
import { OrderPaymentService } from './services/order-payment.service'
import { OrderOperationsService } from './services/order-operations.service'

@Injectable()
export class OrderService {
  constructor(
    private readonly orderCrudService: OrderCrudService,
    private readonly orderPaymentService: OrderPaymentService,
    private readonly orderOperationsService: OrderOperationsService
  ) {}

  // CRUD Operations
  async create(data: CreateOrderDto, accountId: string, branchId: string, deviceId: string) {
    return this.orderCrudService.create(data, accountId, branchId, deviceId)
  }

  async update(
    id: string,
    data: UpdateOrderDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.orderCrudService.update(id, data, accountId, branchId, deviceId)
  }

  async findAll(params: FindManyOrderDto, branchId: string) {
    return this.orderCrudService.findAll(params, branchId)
  }

  async findUniq(id: string, branchId: string) {
    return this.orderCrudService.findUniq(id, branchId)
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string, deviceId: string) {
    return this.orderCrudService.deleteMany(data, accountId, branchId, deviceId)
  }

  // Payment
  async payment(
    id: string,
    data: PaymentOrderDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.orderPaymentService.payment(id, data, accountId, branchId, deviceId)
  }

  // Operations
  async save(id: string, data: SaveOrderDto, branchId: string, deviceId: string) {
    return this.orderOperationsService.save(id, data, branchId, deviceId)
  }

  async cancel(
    id: string,
    data: CancelOrderDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.orderOperationsService.cancel(id, data, accountId, branchId, deviceId)
  }

  async updatePayment(id: string, data: UpdatePaymentDto, accountId: string, branchId: string) {
    return this.orderOperationsService.updatePayment(id, data, accountId, branchId)
  }
}
