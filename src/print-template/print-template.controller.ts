import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards
} from '@nestjs/common'
import { PrintTemplateService } from './print-template.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { SPECIAL_ROLE } from 'enums/common.enum'
import { Roles } from 'guards/roles.decorator'
import { UpdatePrintTemplateDto } from './dto/print-template.dto'
import { TokenPayload } from 'interfaces/common.interface'

@Controller('print-template')
export class PrintTemplateController {
  constructor(private readonly printTemplateService: PrintTemplateService) {}

  @Get('/default/:type')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findDefaultTemplate(@Req() req: any, @Param('type') type: number) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.printTemplateService.findDefaultTemplate(
      {
        type
      },
      tokenPayload
    )
  }

  @Get('/:type')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Req() req: any, @Param('type') type: number) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.printTemplateService.findUniq(
      {
        type
      },
      tokenPayload
    )
  }

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  @Roles('UPDATE_PRINT_TEMPLATE', SPECIAL_ROLE.STORE_OWNER)
  updateOrderDetail(
    @Body() updatePrintTemplateDto: UpdatePrintTemplateDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.printTemplateService.update(
      {
        data: updatePrintTemplateDto
      },
      tokenPayload
    )
  }
}
