import { Body, Controller, Get, HttpCode, HttpStatus, Put, Req, UseGuards } from '@nestjs/common'
import { TaxSettingService } from './tax-setting.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { UpdateTaxSettingDto } from './dto/tax-setting.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tax-setting')
export class TaxSettingController {
  constructor(private readonly taxSettingService: TaxSettingService) {}

  @Get('/current')
  @HttpCode(HttpStatus.OK)
  findUniq(@Req() req: RequestJWT) {
    const { branchId } = req
    return this.taxSettingService.findUniq(branchId)
  }

  @Put('/current')
  @HttpCode(HttpStatus.OK)
  update(@Req() req: RequestJWT, @Body() data: UpdateTaxSettingDto) {
    const { accountId, branchId } = req
    return this.taxSettingService.update(data, accountId, branchId)
  }
}
