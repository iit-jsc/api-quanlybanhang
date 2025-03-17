import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { PaymentMethodService } from './payment-method.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { FindManyDto } from 'utils/Common.dto'
import { TokenPayload } from 'interfaces/common.interface'
import {
  FindManyPaymentMethodDto,
  UpdatePaymentMethodDto
} from './dto/payment-method.dto'
import { Roles } from 'guards/roles.decorator'
import { SPECIAL_ROLE } from 'enums/common.enum'
import { RolesGuard } from 'guards/roles.guard'

@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() data: FindManyPaymentMethodDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.paymentMethodService.findAll(data, tokenPayload)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.paymentMethodService.findUniq(
      {
        id
      },
      tokenPayload
    )
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_PAYMENT_METHOD', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.paymentMethodService.update(
      {
        where: {
          id
        },
        data: updatePaymentMethodDto
      },
      tokenPayload
    )
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_PAYMENT_METHOD', SPECIAL_ROLE.MANAGER)
  create(
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.paymentMethodService.create(
      {
        data: updatePaymentMethodDto
      },
      tokenPayload
    )
  }
}
