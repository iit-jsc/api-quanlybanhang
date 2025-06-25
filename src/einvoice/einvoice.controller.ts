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
   * Test với pattern/serial mặc định của VNPT demo - Thử nhiều số khác nhau
   * API: GetHashInvMTTNoRangeByToken - Lấy giá trị hash hóa đơn máy tính tiền theo danh sách từ số đến số sử dụng token (bước 1)
   *
   * Sử dụng phạm vi số hóa đơn thực tế: 14.994 - 15.093 (tổng 100 số)
   * Pattern: '1/007', Serial: 'K25TNS'
   */
  @Get('test-default-pattern')
  @HttpCode(HttpStatus.OK)
  async testDefaultPattern() {
    try {
      // Sử dụng cấu hình từ service để đảm bảo thống nhất
      const serviceConfig = this.eInvoiceService['config']

      // Phạm vi số hóa đơn thực tế được cấp từ VNPT demo
      const actualInvoiceRange = {
        min: 14994, // Số đầu tiên trong lô
        max: 15093, // Số cuối cùng trong lô
        total: 100 // Tổng số hóa đơn trong lô
      }

      const config = {
        account: serviceConfig.account,
        acPass: serviceConfig.acPass,
        username: serviceConfig.username,
        password: serviceConfig.password,
        pattern: '1/007',
        serial: 'K25TNS',
        serialCert: serviceConfig.serialCert
      }

      // Validate required fields theo doc API
      const requiredFields = [
        'account',
        'acPass',
        'username',
        'password',
        'pattern',
        'serial',
        'serialCert'
      ]
      const missingFields = requiredFields.filter(field => !config[field])

      if (missingFields.length > 0) {
        return {
          success: false,
          message: 'Thiếu cấu hình bắt buộc cho API GetHashInvMTTNoRangeByToken',
          error: {
            code: 'CONFIG_MISSING',
            message: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
            suggestion: 'Kiểm tra file .env và đảm bảo tất cả biến EINVOICE_* được cấu hình đầy đủ'
          },
          config: config,
          requiredFields: requiredFields,
          invoiceRange: actualInvoiceRange
        }
      }

      // Tự động tìm số hóa đơn khả dụng trong phạm vi thực tế
      let availableInvoiceNo = null
      let base64Hash = null
      let errorInfo = null
      let rawResult = null
      const testAttempts = []

      // Thử nhiều số khác nhau trong phạm vi 14994-15093
      const numbersToTry = [
        14994,
        14995,
        14996,
        14997,
        14998, // 5 số đầu tiên
        15000,
        15001,
        15002,
        15003,
        15004, // Ở giữa
        15010,
        15020,
        15030,
        15040,
        15050, // Nhảy cách
        15090,
        15091,
        15092,
        15093 // 4 số cuối
      ]

      console.log(
        `[${new Date().toISOString()}] 🔍 Đang tìm số hóa đơn khả dụng trong lô ${actualInvoiceRange.min}-${actualInvoiceRange.max}`
      )

      // Thử từng số cho đến khi tìm được số khả dụng
      for (const testNumber of numbersToTry) {
        if (base64Hash) break // Đã tìm được hash, thoát vòng lặp

        const testFromNo = testNumber
        const testToNo = testNumber

        console.log(`[${new Date().toISOString()}] 🧪 Thử số ${testFromNo}...`)

        try {
          // Tạo SOAP request cho số hiện tại
          const soapBody = `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
              xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
              xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <GetHashInvMTTNoRangeByToken xmlns="http://tempuri.org/">
                  <Account>${config.account}</Account>
                  <ACpass>${config.acPass}</ACpass>
                  <username>${config.username}</username>
                  <password>${config.password}</password>
                  <pattern>${config.pattern}</pattern>
                  <serial>${config.serial}</serial>
                  <fromNo>${testFromNo}</fromNo>
                  <toNo>${testToNo}</toNo>
                  <serialCert>${config.serialCert}</serialCert>
                </GetHashInvMTTNoRangeByToken>
              </soap:Body>
            </soap:Envelope>
          `

          const result = await this.eInvoiceService['httpService']
            .post('https://h2o-tt78admindemo.vnpt-invoice.com.vn/businessservice.asmx', soapBody, {
              headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                SOAPAction: '"http://tempuri.org/GetHashInvMTTNoRangeByToken"'
              },
              timeout: 60000
            })
            .toPromise()

          // Parse SOAP response
          const responseData = result.data
          let currentResult = null
          let currentError = null

          if (typeof responseData === 'string') {
            const match = responseData.match(
              /<GetHashInvMTTNoRangeByTokenResult>(.*?)<\/GetHashInvMTTNoRangeByTokenResult>/s
            )

            if (match) {
              currentResult = match[1].trim()

              if (currentResult.startsWith('ERR:')) {
                const errorCode = currentResult.substring(4)
                currentError = {
                  code: errorCode,
                  message: this.getErrorMessage(errorCode),
                  suggestion: this.getErrorSuggestion(errorCode)
                }
                console.log(
                  `[${new Date().toISOString()}] ❌ Số ${testFromNo}: ERR:${errorCode} - ${this.getErrorMessage(errorCode)}`
                )
              } else if (currentResult.length > 0) {
                base64Hash = currentResult
                availableInvoiceNo = testFromNo
                rawResult = currentResult
                console.log(
                  `[${new Date().toISOString()}] ✅ Tìm thấy số khả dụng: ${testFromNo}, hash length: ${base64Hash.length}`
                )
                break // Tìm được rồi, thoát vòng lặp
              }
            }
          }

          testAttempts.push({
            number: testFromNo,
            success: !!base64Hash,
            error: currentError,
            resultLength: currentResult ? currentResult.length : 0
          })
        } catch (attemptError) {
          console.log(
            `[${new Date().toISOString()}] 🔥 Lỗi khi thử số ${testFromNo}: ${attemptError.message}`
          )
          testAttempts.push({
            number: testFromNo,
            success: false,
            error: { message: attemptError.message },
            networkError: true
          })
        }
      }

      // Nếu không tìm được số nào, lấy lỗi từ lần thử cuối
      if (!base64Hash && testAttempts.length > 0) {
        const lastAttempt = testAttempts[testAttempts.length - 1]
        errorInfo = {
          code: lastAttempt.error?.code || 'NO_AVAILABLE_NUMBER',
          message: lastAttempt.error?.message || 'Không tìm thấy số hóa đơn khả dụng trong lô',
          suggestion: 'Có thể lô hóa đơn đã hết hoặc đã được gửi thuế. Liên hệ VNPT để cấp lô mới.',
          api: 'GetHashInvMTTNoRangeByToken',
          context: {
            testedNumbers: numbersToTry,
            actualRange: actualInvoiceRange,
            pattern: config.pattern,
            serial: config.serial,
            attempts: testAttempts.length
          }
        }
      }

      const success = base64Hash !== null
      const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

      return {
        success: success,
        timestamp: currentTime,
        message: success
          ? `✅ Lấy hash thành công cho số hóa đơn ${availableInvoiceNo} - Có thể tiếp tục bước 2 (SendInvMTTNoRangeByToken)`
          : `❌ Lấy hash thất bại - Đã thử ${testAttempts.length} số trong lô - Không thể tiến hành bước 2`,
        api: {
          name: 'GetHashInvMTTNoRangeByToken',
          description:
            'Lấy giá trị hash hóa đơn máy tính tiền theo danh sách từ số đến số sử dụng token (bước 1)',
          step: 1,
          nextStep: success ? 'SendInvMTTNoRangeByToken' : null,
          endpoint: 'https://h2o-tt78admindemo.vnpt-invoice.com.vn/businessservice.asmx'
        },
        invoiceRange: {
          actualRange: actualInvoiceRange,
          testedNumbers: numbersToTry,
          foundAvailableNumber: availableInvoiceNo,
          explanation: `Lô hóa đơn được cấp từ ${actualInvoiceRange.min} đến ${actualInvoiceRange.max} (${actualInvoiceRange.total} số)`
        },
        config: {
          ...config,
          serialCert: config.serialCert ? config.serialCert.substring(0, 20) + '...' : 'MISSING'
        },
        result: success
          ? {
              base64Hash: base64Hash.substring(0, 100) + '...',
              hashLength: base64Hash.length,
              fullHashPreview: base64Hash.substring(0, 200) + '...',
              canProceedToStep2: true,
              usedInvoiceNumber: availableInvoiceNo,
              nextAvailableNumber:
                availableInvoiceNo + 1 <= actualInvoiceRange.max ? availableInvoiceNo + 1 : null
            }
          : null,
        error: errorInfo,
        debug: {
          totalAttempts: testAttempts.length,
          testAttempts: testAttempts,
          rawSoapResult: rawResult,
          hasValidResponse: !!rawResult
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] 🔥 Lỗi kết nối VNPT API:`, error.message)

      return {
        success: false,
        timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        message: 'Lỗi kết nối đến API VNPT',
        api: {
          name: 'GetHashInvMTTNoRangeByToken',
          step: 1,
          failed: true,
          endpoint: 'https://h2o-tt78admindemo.vnpt-invoice.com.vn/businessservice.asmx'
        },
        error: {
          type: 'NETWORK_ERROR',
          message: error.message,
          suggestion:
            'Kiểm tra kết nối mạng và URL VNPT. Đảm bảo https://h2o-tt78admindemo.vnpt-invoice.com.vn có thể truy cập được.',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        config: {
          pattern: '1/007',
          serial: 'K25TNS',
          endpoint: 'https://h2o-tt78admindemo.vnpt-invoice.com.vn/businessservice.asmx'
        }
      }
    }
  }

  /**
   * Lấy thông báo lỗi chi tiết
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages = {
      '1': 'Tài khoản đăng nhập sai hoặc không có quyền',
      '3': 'Dữ liệu XML đầu vào không đúng quy định',
      '4': 'Dữ liệu ký không hợp lệ',
      '5': 'Có lỗi xảy ra (lỗi không xác định)',
      '6': 'Không đủ số lượng hóa đơn để phát hành',
      '7': 'Thông tin Username/password không hợp lệ',
      '8': 'Từ số/Đến số truyền vào không hợp lệ',
      '9': 'Từ số không được lớn hơn Đến số',
      '10': 'Lô có số hóa đơn vượt quá số lượng cho phép (500)',
      '11': 'Toàn bộ lô hóa đơn hoặc không tìm thấy hoặc đã gửi thuế',
      '12': 'Thông điệp gửi thuế quá dung lượng 1MB',
      '13': 'Lỗi trùng Fkey',
      '20': 'Thông tin pattern hoặc serial không hợp lệ',
      '21': 'Không tìm thấy công ty hoặc tài khoản không tồn tại',
      '22': 'Công ty chưa đăng ký chứng thư số',
      '24': 'Chứng thư truyền lên không đúng với chứng thư đăng ký',
      '26': 'Chứng thư số hết hạn',
      '27': 'Chứng thư chưa đến thời điểm sử dụng',
      '28': 'Chưa có thông tin chứng thư trong hệ thống',
      '29': 'Chứng thư hết hạn',
      '30': 'Ngày hóa đơn nhỏ hơn ngày hóa đơn đã phát hành',
      '35': 'Thiếu thông tin pattern và serial',
      '51': 'Chứng thư số đã bị thu hồi'
    }

    return errorMessages[errorCode] || `Lỗi không xác định: ${errorCode}`
  }

  /**
   * Lấy gợi ý xử lý lỗi
   */
  private getErrorSuggestion(errorCode: string): string {
    const suggestions = {
      '11': 'Lô hóa đơn đã hết hoặc đã được gửi thuế. Hãy thử với range số khác hoặc liên hệ VNPT để cấp lô hóa đơn mới.',
      '20': 'Pattern và Serial không khớp. Kiểm tra lại thông tin đăng ký với VNPT.',
      '22': 'Công ty chưa đăng ký chứng thư số. Cần đăng ký chứng thư số điện tử với VNPT.',
      '26': 'Chứng thư số đã hết hạn. Cần gia hạn chứng thư số.',
      '1': 'Kiểm tra lại username/password hoặc quyền truy cập tài khoản.',
      '7': 'Thông tin đăng nhập không đúng. Kiểm tra lại username và password.',
      '6': 'Không đủ số lượng hóa đơn. Liên hệ VNPT để mua thêm lô hóa đơn.',
      '8': 'Range số hóa đơn không hợp lệ. Thử với range nhỏ hơn (1-1).',
      '35': 'Thiếu thông tin pattern/serial. Kiểm tra cấu hình trong .env file.'
    }

    return suggestions[errorCode] || 'Liên hệ VNPT để được hỗ trợ chi tiết.'
  }
}
