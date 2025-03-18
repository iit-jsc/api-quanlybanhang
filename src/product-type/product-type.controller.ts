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

import { ProductTypeService } from './product-type.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { Roles } from 'guards/roles.decorator'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { FindBySlugDto, DeleteManyDto } from 'utils/Common.dto'
import {
  CreateProductTypeDto,
  FindManyProductTypeDto,
  UpdateProductTypeDto
} from './dto/product-type.dto'
import { permissions } from 'enums/permissions.enum'

@Controller('product-type')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.productType.create)
  create(@Body() data: CreateProductTypeDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productTypeService.create(data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyProductTypeDto) {
    return this.productTypeService.findAll(data)
  }

  @Get(':keyword')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('keyword') keyword: string, @Query() params: FindBySlugDto) {
    const where = params.isSlug ? { slug: keyword } : { id: keyword }

    return this.productTypeService.findUniq({
      ...where,
      branchId: params.branchId
    })
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.productType.update)
  update(@Param('id') id: string, @Body() data: UpdateProductTypeDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productTypeService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(permissions.productType.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productTypeService.deleteMany(data, accountId, branchId)
  }
}
