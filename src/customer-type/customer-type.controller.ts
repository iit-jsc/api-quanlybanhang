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

import { CustomerTypeService } from './customer-type.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { RequestJWT } from 'interfaces/common.interface'
import { FindManyDto, DeleteManyDto } from 'utils/Common.dto'
import { CreateCustomerTypeDto, UpdateCustomerTypeDto } from './dto/create-customer-type'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'

@Controller('customer-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerTypeController {
  constructor(private readonly customerTypeService: CustomerTypeService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.customerType.create)
  create(@Body() data: CreateCustomerTypeDto, @Req() req: RequestJWT) {
    const { shopId, accountId } = req
    return this.customerTypeService.create(data, accountId, shopId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.customerType))
  findAll(@Query() data: FindManyDto, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.customerTypeService.findAll(data, shopId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.customerType))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.customerTypeService.findUniq(id, shopId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.customerType.update)
  update(@Param('id') id: string, @Body() data: UpdateCustomerTypeDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.customerTypeService.update(id, data, accountId, shopId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.customerType.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.customerTypeService.deleteMany(data, accountId, shopId)
  }
}
