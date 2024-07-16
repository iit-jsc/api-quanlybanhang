import { Module } from '@nestjs/common';
import { PrintTemplateService } from './print-template.service';
import { PrintTemplateController } from './print-template.controller';

@Module({
  controllers: [PrintTemplateController],
  providers: [PrintTemplateService],
})
export class PrintTemplateModule {}
