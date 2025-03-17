import { Controller, Get, Query } from '@nestjs/common'
import { BusinessTypeService } from './business-type.service'
import { FindManyDto } from 'utils/Common.dto'

@Controller('business-type')
export class BusinessTypeController {
  constructor(private readonly businessTypeService: BusinessTypeService) {}

  @Get()
  findAll(@Query() data: FindManyDto) {
    return this.businessTypeService.findAll(data)
  }
}
