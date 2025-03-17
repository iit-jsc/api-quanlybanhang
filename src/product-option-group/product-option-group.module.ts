import { Module } from '@nestjs/common'
import { ProductOptionGroupService } from './product-option-group.service'
import { ProductOptionGroupController } from './product-option-group.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [ProductOptionGroupController],
  providers: [ProductOptionGroupService],
  imports: [CommonModule]
})
export class ProductOptionGroupModule {}
