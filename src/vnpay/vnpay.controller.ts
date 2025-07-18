import { Controller, Post, HttpStatus, UseGuards, HttpCode, Req, Body, Res } from '@nestjs/common'
import { Response } from 'express'
import { VNPayService } from './vnpay.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { CreateQrCodeDto } from './dto/qrCode.dto'
import { SetupMerchantDto } from './dto/merchant.dto'
import { CheckTransactionDto } from './dto/check-transaction.dto'
import { VNPayIPNDto } from './dto/vnpay-ipn.dto'
import { IpWhitelistGuard } from 'security'
import { PaymentReviewingOrderDto } from 'src/order/dto/payment.dto'

@Controller('vnpay')
export class VNPayController {
  constructor(private readonly vnPayService: VNPayService) {}

  @Post('/payment-reviewing')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async paymentReviewing(@Body() data: PaymentReviewingOrderDto, @Req() reqJWT: RequestJWT) {
    const { branchId, accountId, deviceId } = reqJWT

    return await this.vnPayService.paymentReviewing(data, accountId, branchId, deviceId)
  }

  @Post('generate-qr')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async generateQrCode(@Body() data: CreateQrCodeDto, @Req() reqJWT: RequestJWT) {
    const { accountId, branchId, deviceId } = reqJWT

    return await this.vnPayService.generateQrCode(data, branchId, accountId, deviceId)
  }

  @UseGuards(IpWhitelistGuard)
  @Post('setup-merchant')
  @HttpCode(HttpStatus.OK)
  async setupMerchant(@Body() data: SetupMerchantDto) {
    return await this.vnPayService.setupMerchant(data)
  }

  @Post('check-transaction')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async checkTransaction(@Body() dto: CheckTransactionDto, @Req() reqJWT: RequestJWT) {
    const { branchId } = reqJWT

    return this.vnPayService.checkTransaction(dto, branchId)
  }

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  async vnPayIPN(@Body() ipnDto: VNPayIPNDto, @Res({ passthrough: false }) res: Response) {
    const resVNP = await this.vnPayService.vnPayIPNCallback(ipnDto)

    return res.status(200).json(resVNP)
  }
}
