import { Module } from '@nestjs/common'
import { CustomerTypeService } from './customer-type.service'
import { CustomerTypeController } from './customer-type.controller'

@Module({
  providers: [CustomerTypeService],
  controllers: [CustomerTypeController]
})
export class CustomerTypeModule {}
