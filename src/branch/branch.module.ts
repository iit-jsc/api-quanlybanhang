import { Module } from '@nestjs/common'
import { BranchController } from './branch.controller'
import { BranchService } from './branch.service'
import { AreaService, ProductService } from 'src/shop/services'

@Module({
  controllers: [BranchController],
  providers: [BranchService, ProductService, AreaService]
})
export class BranchModule {}
