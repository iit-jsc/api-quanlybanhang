import { Module } from '@nestjs/common'
import { CustomerTypeService } from './customer-type.service'
import { CustomerTypeController } from './customer-type.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  providers: [CustomerTypeService],
  controllers: [CustomerTypeController],
  imports: [CommonModule]
})
export class CustomerTypeModule {}
