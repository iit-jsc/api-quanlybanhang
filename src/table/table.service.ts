import { Injectable } from '@nestjs/common'
import {
  AddDishesByCustomerDto,
  AddDishesDto,
  addDishDto,
  CreateTableDto,
  FindManyTableDto,
  UpdateTableDto
} from './dto/table.dto'
import { DeleteManyDto } from 'utils/Common.dto'
import { PaymentFromTableDto } from 'src/order/dto/payment.dto'
import { SeparateTableDto } from 'src/order/dto/order.dto'
import { Prisma } from '@prisma/client'
import { TableCrudService } from './services/table-crud.service'
import { TableOrderService } from './services/table-order.service'
import { TablePaymentService } from './services/table-payment.service'
import { TableOperationsService } from './services/table-operations.service'

@Injectable()
export class TableService {
  constructor(
    private readonly tableCrudService: TableCrudService,
    private readonly tableOrderService: TableOrderService,
    private readonly tablePaymentService: TablePaymentService,
    private readonly tableOperationsService: TableOperationsService
  ) {}

  // CRUD Operations
  async create(data: CreateTableDto, accountId: string, branchId: string) {
    return this.tableCrudService.create(data, accountId, branchId)
  }

  async findAll(params: FindManyTableDto, branchId: string) {
    return this.tableCrudService.findAll(params, branchId)
  }

  async findUniq(where: Prisma.TableWhereUniqueInput) {
    return this.tableCrudService.findUniq(where)
  }

  async update(id: string, data: UpdateTableDto, accountId: string, branchId: string) {
    return this.tableCrudService.update(id, data, accountId, branchId)
  }

  async deleteMany(data: DeleteManyDto, accountId: string, branchId: string) {
    return this.tableCrudService.deleteMany(data, accountId, branchId)
  }

  // Order Management
  async addDishes(
    tableId: string,
    data: AddDishesDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.tableOrderService.addDishes(tableId, data, accountId, branchId, deviceId)
  }

  async addDishesByCustomer(id: string, data: AddDishesByCustomerDto) {
    return this.tableOrderService.addDishesByCustomer(id, data)
  }

  async addDish(
    tableId: string,
    data: addDishDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.tableOrderService.addDish(tableId, data, accountId, branchId, deviceId)
  }

  // Payment
  async payment(
    tableId: string,
    data: PaymentFromTableDto,
    accountId: string,
    branchId: string,
    deviceId: string
  ) {
    return this.tablePaymentService.payment(tableId, data, accountId, branchId, deviceId)
  }

  // Operations
  async separateTable(id: string, data: SeparateTableDto, accountId: string, branchId: string) {
    return this.tableOperationsService.separateTable(id, data, accountId, branchId)
  }

  async requestPayment(id: string, branchId: string, deviceId: string) {
    return this.tableOperationsService.requestPayment(id, branchId, deviceId)
  }
}
