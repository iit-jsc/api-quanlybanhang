import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [CommonModule],
})
export class ProductModule {}
