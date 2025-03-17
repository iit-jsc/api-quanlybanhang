import { Controller } from '@nestjs/common'
import { PointSettingService } from './point-setting.service'

@Controller('point-setting')
export class PointSettingController {
  constructor(private readonly pointSettingService: PointSettingService) {}

  // @Patch('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // update(
  //   @Body() updatePointSettingDto: UpdatePointSettingDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.pointSettingService.update(
  //     {
  //       data: updatePointSettingDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.pointSettingService.findUniq(tokenPayload)
  // }
}
