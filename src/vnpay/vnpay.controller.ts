import {
  Controller,
  Post,
  HttpStatus,
  UseGuards,
  HttpCode,
  Req,
  Body,
  Delete,
  Param
} from '@nestjs/common'
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

  @Post('generate')
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
  async checkTransaction(@Body() dto: CheckTransactionDto, @Req() reqJWT: RequestJWT) {
    const { branchId } = reqJWT

    return this.vnPayService.checkTransaction(dto, branchId)
  }

  @Delete(':tableId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteTransactionByTableId(@Param('tableId') tableId: string) {
    return await this.vnPayService.deleteTransactionByTableId(tableId)
  }

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  async vnPayIPN(@Body() ipnDto: VNPayIPNDto) {
    return this.vnPayService.vnPayIPNCallback(ipnDto)
  }
}
