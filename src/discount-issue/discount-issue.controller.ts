import { Controller } from '@nestjs/common'
import { DiscountIssueService } from './discount-issue.service'

@Controller('discount-issue')
export class DiscountIssueController {
  constructor(private readonly discountIssueService: DiscountIssueService) {}

  // @Post()
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_DISCOUNT_ISSUE', SPECIAL_ROLE.MANAGER)
  // create(
  //   @Body() createDiscountIssueDto: CreateDiscountIssueDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.discountIssueService.create(
  //     createDiscountIssueDto,
  //     tokenPayload
  //   )
  // }

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_DISCOUNT_ISSUE',
  //   'UPDATE_DISCOUNT_ISSUE',
  //   'DELETE_DISCOUNT_ISSUE',
  //   'VIEW_DISCOUNT_ISSUE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManyDiscountIssueDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.discountIssueService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_DISCOUNT_ISSUE',
  //   'UPDATE_DISCOUNT_ISSUE',
  //   'DELETE_DISCOUNT_ISSUE',
  //   'VIEW_DISCOUNT_ISSUE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.discountIssueService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Get('code/:code')
  // @HttpCode(HttpStatus.OK)
  // findByDiscountCode(
  //   @Param('code') code: string,
  //   @Query('branchId') branchId: string
  // ) {
  //   return this.discountIssueService.findByDiscountCode({
  //     branchId,
  //     code
  //   })
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_DISCOUNT_ISSUE', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() data: UpdateDiscountIssueDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.discountIssueService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('DELETE_DISCOUNT_ISSUE', SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.discountIssueService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
