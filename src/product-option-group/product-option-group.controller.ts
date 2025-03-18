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
import { ProductOptionGroupService } from './product-option-group.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { Roles } from 'guards/roles.decorator'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import {
  CreateProductOptionGroupDto,
  FindManyProductOptionGroupDto,
  UpdateProductOptionGroupDto
} from './dto/product-option-group.dto'
import { permissions } from 'enums/permissions.enum'

@Controller('product-option-group')
export class ProductOptionGroupController {
  constructor(private readonly productOptionGroupService: ProductOptionGroupService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.productOptionGroup.create)
  create(@Body() data: CreateProductOptionGroupDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productOptionGroupService.create(data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyProductOptionGroupDto) {
    return this.productOptionGroupService.findAll(data, data.branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string) {
    return this.productOptionGroupService.findUniq(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.productOptionGroup.update)
  update(
    @Param('id') id: string,
    @Body() data: UpdateProductOptionGroupDto,
    @Req() req: RequestJWT
  ) {
    const { accountId, branchId } = req

    return this.productOptionGroupService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.productOptionGroup.update)
  @Roles(permissions.productOptionGroup.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productOptionGroupService.deleteMany(data, accountId, branchId)
  }
}
