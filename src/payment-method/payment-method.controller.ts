import { Controller } from '@nestjs/common'
import { PaymentMethodService } from './payment-method.service'

@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // findAll(@Query() data: FindManyPaymentMethodDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.paymentMethodService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.paymentMethodService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_PAYMENT_METHOD', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.paymentMethodService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updatePaymentMethodDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('CREATE_PAYMENT_METHOD', SPECIAL_ROLE.MANAGER)
  // create(
  //   @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.paymentMethodService.create(
  //     {
  //       data: updatePaymentMethodDto
  //     },
  //     tokenPayload
  //   )
  // }
}
