import { Module } from '@nestjs/common';
import { ProductTypeController } from './product-type.controller';
import { ProductTypeService } from './product-type.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [ProductTypeController],
  providers: [ProductTypeService],
  imports: [CommonModule],
})
export class ProductTypeModule {}
