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
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { TokenPayload } from 'interfaces/common.interface'
import { DeleteManyDto, FindBySlugDto } from 'utils/Common.dto'
import { ProductService } from './product.service'
import { CreateProductDto, UpdateProductDto } from './dto/product.dto'
import { FindManyProductDto } from './dto/find-many.dto'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { SPECIAL_ROLE } from 'enums/common.enum'

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_PRODUCT', SPECIAL_ROLE.MANAGER)
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.productService.create(createProductDto, tokenPayload)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyProductDto, @Req() req: any) {
    return this.productService.findAll(data)
  }

  @Get(':keyword')
  @HttpCode(HttpStatus.OK)
  findUniq(
    @Param('keyword') keyword: string,
    @Query() findBySlugDto: FindBySlugDto
  ) {
    const where = findBySlugDto.isSlug ? { slug: keyword } : { id: keyword }

    return this.productService.findUniq({
      ...where,
      branchId: findBySlugDto.branchId
    })
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_PRODUCT', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.productService.update(
      {
        where: {
          id
        },
        data: updateProductDto
      },
      tokenPayload
    )
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_PRODUCT', SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.productService.deleteMany(
      {
        ids: deleteManyDto.ids
      },
      tokenPayload
    )
  }
}
