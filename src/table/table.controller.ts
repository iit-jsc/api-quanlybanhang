import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { TableService } from './table.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import {
  AddDishesByCustomerDto,
  AddDishesDto,
  CreateTableDto,
  FindManyTableDto,
  UpdateDishDto,
  UpdateTableDto
} from './dto/table.dto'
import { Roles } from 'guards/roles.decorator'
import { RolesGuard } from 'guards/roles.guard'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'
import { PaymentFromTableDto, RequestPaymentDto } from 'src/order/dto/payment.dto'
import { SeparateTableDto } from 'src/order/dto/order.dto'

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.create)
  create(
    @Body() data: CreateTableDto,

    @Req() req: RequestJWT
  ) {
    const { accountId, branchId } = req

    return this.tableService.create(data, accountId, branchId)
  }

  @Post(':id/add-dishes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.addDish)
  addDishes(@Param('id') id: string, @Body() data: AddDishesDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req

    return this.tableService.addDishes(id, data, accountId, branchId, deviceId)
  }

  @Post(':id/update-dish')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.addDish)
  updateDish(@Param('id') id: string, @Body() data: UpdateDishDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req

    return this.tableService.updateDish(id, data, accountId, branchId, deviceId)
  }

  @Post(':id/add-dishes-by-customer')
  @HttpCode(HttpStatus.OK)
  addDishesByCustomer(@Param('id') id: string, @Body() data: AddDishesByCustomerDto) {
    return this.tableService.addDishesByCustomer(id, data)
  }

  @Post('/:id/payment')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.order.payment)
  payment(@Param('id') id: string, @Body() data: PaymentFromTableDto, @Req() req: RequestJWT) {
    const { accountId, branchId, deviceId } = req

    return this.tableService.payment(id, data, accountId, branchId, deviceId)
  }

  @Post('/:id/request-payment')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  requestPayment(@Param('id') id: string, @Body() data: RequestPaymentDto, @Req() req: RequestJWT) {
    const { deviceId } = req
    return this.tableService.requestPayment(id, data.branchId, deviceId)
  }

  @Post(':id/separate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.separate)
  separateTable(@Param('id') id: string, @Body() data: SeparateTableDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.tableService.separateTable(id, data, accountId, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.update)
  update(@Param('id') id: string, @Body() data: UpdateTableDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.tableService.update(id, data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...extractPermissions(permissions.table))
  findAll(@Query() data: FindManyTableDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.tableService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string) {
    return this.tableService.findUniq({
      id
    })
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.table.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.tableService.deleteMany(data, accountId, branchId)
  }
}
