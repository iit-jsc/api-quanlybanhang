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
import { CustomerService } from './customer.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { RequestJWT } from 'interfaces/common.interface'
import { CheckUniqDto, DeleteManyDto } from 'utils/Common.dto'
import { CreateCustomerDto, FindManyCustomerDto, UpdateCustomerDto } from './dto/customer.dto'
import { permissions } from 'enums/permissions.enum'
import { extractPermissions } from 'utils/Helps'

@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.customer.create)
  create(@Body() data: CreateCustomerDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.customerService.create(data, accountId, shopId)
  }

  @Get('/check-valid-field')
  @HttpCode(HttpStatus.OK)
  checkValidField(@Query() data: CheckUniqDto, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.customerService.checkValidField(data, shopId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.customer))
  findAll(@Query() data: FindManyCustomerDto, @Req() req: RequestJWT) {
    const { shopId } = req
    return this.customerService.findAll(data, shopId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.customer))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { shopId } = req

    return this.customerService.findUniq(id, shopId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.customer.update)
  update(@Param('id') id: string, @Body() data: UpdateCustomerDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.customerService.update(id, data, accountId, shopId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.customer.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, shopId } = req

    return this.customerService.deleteMany(data, accountId, shopId)
  }
}
