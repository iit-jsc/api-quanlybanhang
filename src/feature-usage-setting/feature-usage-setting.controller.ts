import { Controller } from '@nestjs/common'
import { FeatureUsageSettingService } from './feature-usage-setting.service'

@Controller('feature-usage-setting')
export class FeatureUsageSettingController {
  constructor(
    private readonly featureUsageSettingService: FeatureUsageSettingService
  ) {}

  // @Get(':featureCode')
  // @HttpCode(HttpStatus.OK)
  // findUniq(
  //   @Query() findUniqDto: FindUniqFutureUsageSettingDto,
  //   @Param('featureCode') featureCode: string
  // ) {
  //   return this.featureUsageSettingService.findUniq(featureCode, findUniqDto)
  // }

  // @Patch('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SPECIAL_ROLE.STORE_OWNER)
  // update(
  //   @Body() updateFeatureUsageSettingDto: UpdateFeatureUsageSettingDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.featureUsageSettingService.update(
  //     { data: updateFeatureUsageSettingDto },
  //     tokenPayload
  //   )
  // }
}
