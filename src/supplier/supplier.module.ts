import { Module } from '@nestjs/common'
import { SupplierService } from './supplier.service'
import { SupplierController } from './supplier.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [SupplierController],
  providers: [SupplierService],
  imports: [CommonModule]
})
export class SupplierModule {}
