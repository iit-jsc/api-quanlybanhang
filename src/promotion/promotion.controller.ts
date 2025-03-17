import { Controller } from '@nestjs/common'
import { PromotionService } from './promotion.service'

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  // @Post()
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_PROMOTION', SPECIAL_ROLE.MANAGER)
  // create(@Body() createPromotionDto: CreatePromotionDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.promotionService.create(createPromotionDto, tokenPayload)
  // }

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // findAll(@Query() data: FindManyPromotionDto) {
  //   return this.promotionService.findAll(data)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // findUniq(@Param('id') id: string) {
  //   return this.promotionService.findUniq({
  //     id
  //   })
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_PROMOTION', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePromotionDto: UpdatePromotionDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.promotionService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updatePromotionDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_PROMOTION', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.promotionService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
