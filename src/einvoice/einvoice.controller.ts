import { Controller, Get, Post, Body, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { EInvoiceService } from './einvoice.service'

@Controller('einvoice')
export class EInvoiceController {
  constructor(private readonly eInvoiceService: EInvoiceService) {}

  /**
   * API chính: Gửi hóa đơn điện tử đến CQT
   * POST /einvoice/send-to-tax
   */
  @Post('send-to-tax')
  @HttpCode(HttpStatus.OK)
  async sendInvoiceToTax(
    @Body()
    orderData: {
      orderId: string
      invoiceNo: number
      total: number
      customerName?: string
      customerAddress?: string
      products?: Array<{
        name: string
        quantity: number
        price: number
        total: number
      }>
    }
  ) {
    try {
      console.log(`[API] Yêu cầu gửi hóa đơn điện tử:`, orderData)

      const result = await this.eInvoiceService.sendInvoiceToTax(orderData)

      if (result.success) {
        return {
          success: true,
          message: `✅ Gửi hóa đơn điện tử thành công!`,
          data: {
            orderId: orderData.orderId,
            invoiceNumber: result.invoiceNumber,
            messageId: result.messageId,
            timestamp: new Date().toISOString()
          }
        }
      } else {
        return {
          success: false,
          message: `❌ Gửi hóa đơn điện tử thất bại`,
          error: result.error,
          orderId: orderData.orderId
        }
      }
    } catch (error) {
      console.error(`[API] Lỗi gửi hóa đơn:`, error.message)
      return {
        success: false,
        message: 'Lỗi hệ thống khi gửi hóa đơn điện tử',
        error: error.message
      }
    }
  }

  /**
   * API: Lấy hash cho số hóa đơn cụ thể
   * GET /einvoice/get-hash/:invoiceNo
   */
  @Get('get-hash/')
  @HttpCode(HttpStatus.OK)
  async getInvoiceHash() {
    try {
      console.log(`[API] Yêu cầu lấy hash cho số hóa đơn: `)

      const result = await this.eInvoiceService.getInvoiceHash()

      if (result.success) {
        return {
          success: true,
          message: `Lấy hash thành công cho số hóa đơn `,
          data: {
            base64Hash: result.base64Hash.substring(0, 100) + '...',
            hashLength: result.base64Hash.length,
            canProceedToSend: true
          }
        }
      } else {
        return {
          success: false,
          message: `Lấy hash thất bại cho số hóa đơn `,
          error: result.error
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy hash hóa đơn',
        error: error.message
      }
    }
  }

  /**
   * API: Tìm số hóa đơn khả dụng tiếp theo
   * GET /einvoice/find-available
   */
  @Get('find-available')
  @HttpCode(HttpStatus.OK)
  async findAvailableInvoiceNumber() {
    try {
      console.log('[API] Tìm số hóa đơn khả dụng...')

      const result = await this.eInvoiceService.findAvailableInvoiceNumber()

      if (result.success) {
        return {
          success: true,
          message: `Tìm thấy số hóa đơn khả dụng: ${result.invoiceNumber}`,
          data: {
            invoiceNumber: result.invoiceNumber,
            pattern: '2/001',
            serial: 'C25MIT',
            canUse: true,
            range: {
              min: 1,
              max: 1000,
              total: 1000,
              description: 'Lô hóa đơn từ 0000001 đến 0001000'
            }
          }
        }
      } else {
        return {
          success: false,
          message: 'Không tìm thấy số hóa đơn khả dụng',
          error: result.error,
          suggestion: 'Liên hệ VNPT để cấp lô hóa đơn mới hoặc kiểm tra lại cấu hình'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi tìm số hóa đơn khả dụng',
        error: error.message
      }
    }
  }

  /**
   * API Test: Test toàn bộ quy trình với dữ liệu mẫu
   * POST /einvoice/test-full-process
   */
  @Post('test-full-process')
  @HttpCode(HttpStatus.OK)
  async testFullProcess(@Body() customData?: any) {
    try {
      console.log('[API] Bắt đầu test toàn bộ quy trình HĐĐT...')

      // Bước 1: Tìm số hóa đơn khả dụng
      const availableResult = await this.eInvoiceService.findAvailableInvoiceNumber()
      if (!availableResult.success) {
        return {
          success: false,
          message: 'Không thể tìm số hóa đơn khả dụng',
          error: availableResult.error
        }
      }

      // Bước 2: Tạo dữ liệu đơn hàng test
      const testOrderData = {
        orderId: `TEST_ORDER_${Date.now()}`,
        invoiceNo: availableResult.invoiceNumber,
        total: customData?.total || 100000,
        customerName: customData?.customerName || 'Khách hàng test',
        customerAddress: customData?.customerAddress || '123 Đường test, Quận 1, TP.HCM',
        products: customData?.products || [
          {
            name: 'Cơm gà nướng',
            quantity: 1,
            price: 50000,
            total: 50000
          },
          {
            name: 'Nước chanh',
            quantity: 2,
            price: 25000,
            total: 50000
          }
        ]
      }

      // Bước 3: Gửi hóa đơn đến CQT
      const sendResult = await this.eInvoiceService.sendInvoiceToTax(testOrderData)

      return {
        success: sendResult.success,
        message: sendResult.success
          ? '🎉 Test toàn bộ quy trình thành công!'
          : '❌ Test quy trình thất bại',
        data: {
          step1_findAvailable: {
            success: true,
            invoiceNumber: availableResult.invoiceNumber
          },
          step2_testOrder: testOrderData,
          step3_sendResult: sendResult
        },
        guide: {
          step1: 'Tìm số hóa đơn khả dụng',
          step2: 'Tạo dữ liệu đơn hàng test',
          step3: 'Gửi hóa đơn đến CQT và nhận messageId'
        }
      }
    } catch (error) {
      console.error('[API] Lỗi test quy trình:', error.message)
      return {
        success: false,
        message: 'Lỗi khi test toàn bộ quy trình',
        error: error.message
      }
    }
  }

  /**
   * API: Lấy cấu hình hiện tại
   * GET /einvoice/config
   */
  @Get('config')
  @HttpCode(HttpStatus.OK)
  async getConfig() {
    return {
      success: true,
      message: 'Cấu hình hóa đơn điện tử VNPT - Dải số mới nhất',
      data: {
        baseUrl: 'https://h2o-tt78admindemo.vnpt-invoice.com.vn',
        pattern: '2/001',
        serial: 'C25MIT',
        account: 'nguyenvana',
        invoiceRange: {
          min: 1,
          max: 1000,
          total: 1000,
          description: 'Phạm vi số hóa đơn: 0000001 đến 0001000 (1000 số)'
        },
        apis: {
          getHash: 'GetHashInvMTTNoRangeByToken (Bước 1)',
          sendInvoice: 'SendInvMTTNoRangeByToken (Bước 2)'
        },
        lastUpdated: '2024-12-20',
        note: 'Đã cập nhật theo thông báo phát hành hóa đơn mới nhất từ VNPT'
      }
    }
  }

  /**
   * API: Kiểm tra trạng thái hóa đơn theo messageId
   * GET /einvoice/check-status/:messageId
   */
  @Get('check-status/:messageId')
  @HttpCode(HttpStatus.OK)
  async checkInvoiceStatus(@Param('messageId') messageId: string) {
    try {
      console.log(`[API] Kiểm tra trạng thái hóa đơn: ${messageId}`)

      const result = await this.eInvoiceService.checkInvoiceStatus(messageId)

      if (result.success) {
        return {
          success: true,
          message: `Trạng thái hóa đơn ${messageId}`,
          data: {
            messageId: messageId,
            status: result.status,
            statusText: result.statusText,
            invoiceNumber: result.invoiceNumber,
            checkTime: new Date().toISOString()
          }
        }
      } else {
        return {
          success: false,
          message: `Không thể kiểm tra trạng thái hóa đơn ${messageId}`,
          error: result.error
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi kiểm tra trạng thái hóa đơn',
        error: error.message
      }
    }
  }
}
