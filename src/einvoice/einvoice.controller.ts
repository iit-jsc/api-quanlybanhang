import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { EInvoiceService } from './einvoice.service'

@Controller('einvoice')
export class EInvoiceController {
  constructor(private readonly eInvoiceService: EInvoiceService) {}

  /**
   * Test kết nối đến VNPT API
   */
  @Get('test-connection')
  @HttpCode(HttpStatus.OK)
  async testConnection() {
    return this.eInvoiceService.testConnection()
  }

  /**
   * Test tạo hóa đơn mẫu
   */
  @Post('test-invoice')
  @HttpCode(HttpStatus.OK)
  async testInvoice(@Body() customData?: any) {
    // Dữ liệu mẫu để test
    const testInvoiceData = {
      customer: {
        cusCode: 'KH001',
        cusName: customData?.customerName || 'Khách hàng test',
        cusAddress: customData?.customerAddress || '123 Đường ABC, Quận 1, TP.HCM',
        cusPhone: customData?.customerPhone || '0123456789',
        cusTaxCode: customData?.customerTaxCode || ''
      },
      products: [
        {
          prodName: 'Cơm gà',
          prodUnit: 'Phần',
          prodQuantity: 1,
          prodPrice: 50000,
          total: 50000,
          vatRate: 10,
          vatAmount: 5000,
          amount: 55000
        },
        {
          prodName: 'Nước ngọt',
          prodUnit: 'Chai',
          prodQuantity: 2,
          prodPrice: 15000,
          total: 30000,
          vatRate: 10,
          vatAmount: 3000,
          amount: 33000
        }
      ],
      total: 80000,
      vatAmount: 8000,
      amount: 88000,
      amountInWords: 'Tám mươi tám nghìn đồng',
      paymentMethod: 'Tiền mặt',
      note: 'Hóa đơn test từ hệ thống',
      fkey: `TEST_${Date.now()}`
    }

    try {
      const result = await this.eInvoiceService.publishInvoice(testInvoiceData)
      return {
        success: true,
        message: 'Test invoice completed',
        data: result,
        testData: testInvoiceData
      }
    } catch (error) {
      return {
        success: false,
        message: 'Test invoice failed',
        error: error.message,
        testData: testInvoiceData
      }
    }
  }

  /**
   * Lấy cấu hình E-Invoice hiện tại
   */
  @Get('config')
  @HttpCode(HttpStatus.OK)
  async getConfig() {
    return {
      success: true,
      message: 'E-Invoice configuration',
      data: this.eInvoiceService['config'] // Access private config
    }
  }

  /**
   * Kiểm tra trạng thái Pattern/Serial
   */
  @Get('check-pattern-serial')
  @HttpCode(HttpStatus.OK)
  async checkPatternSerial() {
    return this.eInvoiceService.checkPatternSerialStatus()
  }

  /**
   * Tìm range số hóa đơn khả dụng
   */
  @Get('find-available-range')
  @HttpCode(HttpStatus.OK)
  async findAvailableRange() {
    return this.eInvoiceService.findAvailableInvoiceRange()
  }

  /**
   * Test với pattern/serial mặc định của VNPT demo
   */
  @Get('test-default-pattern')
  @HttpCode(HttpStatus.OK)
  async testDefaultPattern() {
    try {
      // Sử dụng pattern/serial mặc định của VNPT demo
      const defaultConfig = {
        account: 'nguyenvana',
        acPass: 'vnpt01234',
        username: 'nguyenvana',
        password: 'vnpt01234',
        pattern: '01GTKT0/001', // Pattern mặc định
        serial: 'AA/17E', // Serial mặc định
        serialCert: 'DEMO_CERT_123'
      }

      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetHashInvMTTNoRangeByToken xmlns="http://tempuri.org/">
      <Account>${defaultConfig.account}</Account>
      <ACpass>${defaultConfig.acPass}</ACpass>
      <username>${defaultConfig.username}</username>
      <password>${defaultConfig.password}</password>
      <pattern>${defaultConfig.pattern}</pattern>
      <serial>${defaultConfig.serial}</serial>
      <fromNo>1</fromNo>
      <toNo>1</toNo>
      <serialCert>${defaultConfig.serialCert}</serialCert>
    </GetHashInvMTTNoRangeByToken>
  </soap:Body>
</soap:Envelope>`

      const result = await this.eInvoiceService['httpService']
        .post('https://h2o-tt78admindemo.vnpt-invoice.com.vn/businessservice.asmx', soapBody, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: '"http://tempuri.org/GetHashInvMTTNoRangeByToken"'
          },
          timeout: 30000
        })
        .toPromise()

      return {
        success: true,
        message: 'Test với pattern/serial mặc định',
        config: defaultConfig,
        response: result.data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi test pattern/serial mặc định',
        error: error.message,
        response: error.response?.data
      }
    }
  }
}
