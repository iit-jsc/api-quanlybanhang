import { Module } from '@nestjs/common';
import { SupplierTypeService } from './supplier-type.service';
import { SupplierTypeController } from './supplier-type.controller';

@Module({
  controllers: [SupplierTypeController],
  providers: [SupplierTypeService],
})
export class SupplierTypeModule {}
