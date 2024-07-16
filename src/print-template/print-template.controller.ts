import { Controller } from '@nestjs/common';
import { PrintTemplateService } from './print-template.service';

@Controller('print-template')
export class PrintTemplateController {
  constructor(private readonly printTemplateService: PrintTemplateService) {}
}
