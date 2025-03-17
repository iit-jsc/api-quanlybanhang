import { Module } from '@nestjs/common'
import { PrintTemplateService } from './print-template.service'
import { PrintTemplateController } from './print-template.controller'
import { CommonModule } from 'src/common/common.module'

@Module({
  controllers: [PrintTemplateController],
  providers: [PrintTemplateService],
  imports: [CommonModule]
})
export class PrintTemplateModule {}
