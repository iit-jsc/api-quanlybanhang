import { Body, Controller, Post, Req, Res, Get } from '@nestjs/common'
import { VnpayService } from './vnpay.service'
import { CreatePaymentDto } from './dto/createPaymentUrl.dto'
import { Request, Response } from 'express'

@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Post('create-payment-url')
  async createPaymentUrl(
    @Body() data: CreatePaymentDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const ipAddr =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      ''

    const paymentUrl = await this.vnpayService.createPaymentUrl(data, ipAddr)

    res.redirect(paymentUrl)
  }

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
    const vnp_Params = { ...req.query }
    const secureHash = vnp_Params['vnp_SecureHash'] as string
    const rspCode = vnp_Params['vnp_ResponseCode']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    // Xác thực checksum
    const isValid = this.vnpayService.verifyReturn(vnp_Params, secureHash)

    // TODO: Thay bằng truy vấn thực tế trong DB
    const checkOrderId = true // kiểm tra orderId tồn tại
    const checkAmount = true // kiểm tra amount đúng
    const paymentStatus = '0' // trạng thái đơn hàng: 0-khởi tạo, 1-thành công, 2-thất bại

    if (isValid) {
      if (checkOrderId) {
        if (checkAmount) {
          if (paymentStatus === '0') {
            if (rspCode === '00') {
              // TODO: cập nhật trạng thái thành công vào DB
              res.status(200).json({ RspCode: '00', Message: 'Success' })
            } else {
              // TODO: cập nhật trạng thái thất bại vào DB
              res.status(200).json({ RspCode: '00', Message: 'Success' })
            }
          } else {
            res.status(200).json({
              RspCode: '02',
              Message: 'This order has been updated to the payment status'
            })
          }
        } else {
          res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
        }
      } else {
        res.status(200).json({ RspCode: '01', Message: 'Order not found' })
      }
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
    }
  }
}
