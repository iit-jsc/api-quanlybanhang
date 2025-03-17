import { Module } from '@nestjs/common'
import { BranchController } from './branch.controller'
import { BranchService } from './branch.service'
import { ShopModule } from 'src/shop/shop.module'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [BranchController],
  providers: [BranchService],
  imports: [ShopModule, CommonModule]
})
export class BranchModule {}
