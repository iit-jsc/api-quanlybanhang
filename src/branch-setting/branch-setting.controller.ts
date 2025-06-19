import { Body, Controller, HttpCode, HttpStatus, Patch, Req, UseGuards } from '@nestjs/common'
import { BranchSettingService } from './branch-setting.service'
import { UpdateBranchSetting } from './dto/branch-setting.dto'
import { RequestJWT } from 'interfaces/common.interface'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'

@Controller('branch-setting')
@UseGuards(JwtAuthGuard)
export class BranchSettingController {
  constructor(private readonly branchSettingService: BranchSettingService) {}

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  login(@Body() data: UpdateBranchSetting, @Req() req: RequestJWT) {
    const { branchId, accountId } = req
    return this.branchSettingService.updateBranchSetting(data, branchId, accountId)
  }
}
