import { Controller } from '@nestjs/common'
import { ProductOptionGroupService } from './product-option-group.service'

@Controller('product-option-group')
export class ProductOptionGroupController {
  constructor(
    private readonly productOptionGroupService: ProductOptionGroupService
  ) {}

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_PRODUCT_OPTION_GROUP', SPECIAL_ROLE.MANAGER)
  // create(
  //   @Body() createProductOptionGroupDto: CreateProductOptionGroupDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.productOptionGroupService.create(
  //     createProductOptionGroupDto,
  //     tokenPayload
  //   )
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // findAll(@Query() data: FindManyProductOptionGroupDto) {
  //   return this.productOptionGroupService.findAll(data, data.branchId)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // findUniq(@Param('id') id: string) {
  //   return this.productOptionGroupService.findUniq({
  //     id
  //   })
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_PRODUCT_OPTION_GROUP', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() UpdateProductOptionGroupDto: UpdateProductOptionGroupDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.productOptionGroupService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: UpdateProductOptionGroupDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_PRODUCT_OPTION_GROUP', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.productOptionGroupService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
