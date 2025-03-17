import { Controller } from '@nestjs/common'
import { TransporterService } from './transporter.service'

@Controller('transporter')
export class TransporterController {
  constructor(private readonly transporterService: TransporterService) {}
}
