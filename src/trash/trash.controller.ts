import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common'
import { TrashService } from './trash.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { FindManyTrashDto } from './dto/trash.dto'

@Controller('trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  findMany(@Query() data: FindManyTrashDto) {
    return this.trashService.findMany(data)
  }
}
