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
import { CustomerRequestService } from './customer-request.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import {
  CreateCustomerRequestDto,
  FindManyCustomerRequestDto,
  FindUniqCustomerRequestDto,
  UpdateCustomerRequestDto
} from './dto/customer-request.dto'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { permissions } from 'enums/permissions.enum'

@Controller('customer-request')
export class CustomerRequestController {
  constructor(private readonly customerRequestService: CustomerRequestService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() data: CreateCustomerRequestDto) {
    return this.customerRequestService.create(data)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyCustomerRequestDto) {
    const { branchId } = data

    return this.customerRequestService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string, @Query() data: FindUniqCustomerRequestDto) {
    const { branchId } = data

    return this.customerRequestService.findUniq(id, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Roles(permissions.customerRequest.update)
  update(@Param('id') id: string, @Body() data: UpdateCustomerRequestDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.customerRequestService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.customerRequest.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.customerRequestService.deleteMany(data, accountId, branchId)
  }
}
