import { Controller, Req, Res, Get, Post, Body } from '@nestjs/common'
import { VnpayService } from './vnpay.service'
import { Request, Response } from 'express'
import { CreateConfigDto } from './dto/createPaymentUrl.dto'

@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Get('vnpay-return')
  async vnpayReturn(@Req() req: Request, @Res() res: Response) {
    // Lấy params từ query
    const vnp_Params = { ...req.query }
    const secureHash = vnp_Params['vnp_SecureHash'] as string
    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    // Gọi service để xác thực chữ ký
    const isValid = this.vnpayService.verifyReturn(vnp_Params, secureHash)
    if (isValid) {
      // Có thể kiểm tra thêm logic đơn hàng ở đây
      res.status(200).json({ code: vnp_Params['vnp_ResponseCode'] })
    } else {
      res.status(400).json({ code: '97', message: 'Sai chữ ký' })
    }
  }

  @Get('vnpay-ipn')
  async vnpayIpn(@Req() req: Request, @Res() res: Response) {
    return this.vnpayService.vnpayIpn(req, res)
  }

  @Post('config')
  async createConfig(@Body() data: CreateConfigDto) {
    return this.vnpayService.createConfig(data)
  }
}
