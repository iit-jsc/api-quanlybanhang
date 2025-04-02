import { Module } from '@nestjs/common'
import { ProductOptionGroupService } from './product-option-group.service'
import { ProductOptionGroupController } from './product-option-group.controller'

@Module({
  controllers: [ProductOptionGroupController],
  providers: [ProductOptionGroupService]
})
export class ProductOptionGroupModule {}
