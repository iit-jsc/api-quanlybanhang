import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import { TestService } from './test.service'

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('vnpay-invoice-pdf')
  async getVnpayInvoicePdf(@Res() res: Response) {
    try {
      const pdfBuffer = await this.testService.getVnpayInvoicePdf()

      // Set headers để hiển thị PDF trên trình duyệt
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="vnpay-invoice.pdf"',
        'Content-Length': pdfBuffer.length
      })

      res.send(pdfBuffer)
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch PDF',
        message: error.message
      })
    }
  }
}
