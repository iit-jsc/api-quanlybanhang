import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { NotifyService } from './notify.service'
import { RequestJWT } from 'interfaces/common.interface'
import { FindManyDto } from 'utils/Common.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyDto, @Req() req: RequestJWT) {
    const { accountId } = req

    return this.notifyService.findAll(data, accountId)
  }

  @Patch('/read-all')
  @HttpCode(HttpStatus.OK)
  readAll(@Req() req: RequestJWT) {
    const { accountId } = req
    return this.notifyService.readAll(accountId)
  }

  @Patch('/:id/read')
  @HttpCode(HttpStatus.OK)
  read(@Param('id') id: string, @Req() req: RequestJWT) {
    const { accountId } = req
    return this.notifyService.read(id, accountId)
  }
}
