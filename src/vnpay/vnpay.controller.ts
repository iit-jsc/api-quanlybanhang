import {
  Controller,
  Post,
  HttpStatus,
  UseGuards,
  HttpCode,
  Req,
  Body,
  Delete,
  Param,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import { VNPayService } from './vnpay.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { CreateQrCodeDto } from './dto/qrCode.dto'
import { SetupMerchantDto } from './dto/merchant.dto'
import { CheckTransactionDto } from './dto/check-transaction.dto'
import { VNPayIPNDto } from './dto/vnpay-ipn.dto'

@Controller('vnpay')
export class VNPayController {
  constructor(private readonly vnPayService: VNPayService) {}

  @Post('generate-qr')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async generateQrCode(@Body() data: CreateQrCodeDto, @Req() reqJWT: RequestJWT) {
    const { accountId, branchId } = reqJWT

    return await this.vnPayService.generateQrCode(data, branchId, accountId)
  }

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

  @Delete('transaction/:tableId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteTransactionByTableId(@Param('tableId') tableId: string, @Req() reqJWT: RequestJWT) {
    const { branchId } = reqJWT

    return await this.vnPayService.deleteTransactionByTableId(tableId, branchId)
  }

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  async vnPayIPN(@Body() ipnDto: VNPayIPNDto, @Res({ passthrough: false }) res: Response) {
    const resVNP = await this.vnPayService.vnPayIPNCallback(ipnDto)

    return res.status(200).json(resVNP)
  }
}
