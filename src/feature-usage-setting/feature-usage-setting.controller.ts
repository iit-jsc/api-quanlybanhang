import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body
} from '@nestjs/common'
import { FeatureUsageSettingService } from './feature-usage-setting.service'
import { TokenPayload } from 'interfaces/common.interface'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { Roles } from 'guards/roles.decorator'
import { SPECIAL_ROLE } from 'enums/common.enum'
import { RolesGuard } from 'guards/roles.guard'
import {
  FindUniqFutureUsageSettingDto,
  UpdateFeatureUsageSettingDto
} from './dto/update-future-usage-setting.dto'
import { FindUniqDto } from 'utils/Common.dto'

@Controller('feature-usage-setting')
export class FeatureUsageSettingController {
  constructor(
    private readonly featureUsageSettingService: FeatureUsageSettingService
  ) {}

  @Get(':featureCode')
  @HttpCode(HttpStatus.OK)
  findUniq(
    @Query() findUniqDto: FindUniqFutureUsageSettingDto,
    @Param('featureCode') featureCode: string
  ) {
    return this.featureUsageSettingService.findUniq(featureCode, findUniqDto)
  }

  @Patch('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SPECIAL_ROLE.STORE_OWNER)
  update(
    @Body() updateFeatureUsageSettingDto: UpdateFeatureUsageSettingDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.featureUsageSettingService.update(
      { data: updateFeatureUsageSettingDto },
      tokenPayload
    )
  }
}
