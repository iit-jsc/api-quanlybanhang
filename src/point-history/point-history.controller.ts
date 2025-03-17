import { Controller } from '@nestjs/common'
import { PointHistoryService } from './point-history.service'

@Controller('point-history')
export class PointHistoryController {
  constructor(private readonly pointHistoryService: PointHistoryService) {}

  // @Get('/')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtCustomerAuthGuard)
  // findManyPointHistory(@Req() req: any) {
  //   const tokenPayload = req.tokenCustomerPayload as TokenCustomerPayload

  //   return this.pointHistoryService.findManyPointHistory(tokenPayload)
  // }

  // @Get('/:id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtCustomerAuthGuard)
  // findUniqPointerHistory(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenCustomerPayload as TokenCustomerPayload

  //   return this.pointHistoryService.findUniqPointerHistory({ id }, tokenPayload)
  // }
}
