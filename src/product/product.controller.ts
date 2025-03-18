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
import { ProductService } from './product.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { FindBySlugDto, DeleteManyDto } from 'utils/Common.dto'
import { CreateProductDto, FindManyProductDto, UpdateProductDto } from './dto/product.dto'
import { permissions } from 'enums/permissions.enum'
import { Roles } from 'guards/roles.decorator'
import { extractPermissions } from 'utils/Helps'

@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.product.create)
  create(@Body() data: CreateProductDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productService.create(data, accountId, branchId)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.product))
  findAll(@Query() data: FindManyProductDto) {
    return this.productService.findAll(data)
  }

  @Get(':keyword')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.product))
  findUniq(@Param('keyword') keyword: string, @Query() params: FindBySlugDto) {
    const where = params.isSlug ? { slug: keyword } : { id: keyword }

    return this.productService.findUniq({
      ...where,
      branchId: params.branchId
    })
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.product.update)
  update(@Param('id') id: string, @Body() data: UpdateProductDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.product.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.productService.deleteMany(data, accountId, branchId)
  }
}
