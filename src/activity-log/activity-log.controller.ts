import { Controller, Get, HttpCode, HttpStatus, Query, Req } from '@nestjs/common'
import { ActivityLogService } from './activity-log.service'
import { FindManyActivityLogDto } from './dto/activity-log.dto'
import { RequestJWT } from 'interfaces/common.interface'

@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyActivityLogDto, @Req() req: RequestJWT) {
    const { shopId } = req
    return this.activityLogService.findAll(data, shopId)
  }
}
