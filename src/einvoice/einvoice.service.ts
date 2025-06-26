import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'

export interface EInvoiceConfig {
  baseUrl: string
  account: string
  acPass: string
  username: string
  password: string
  pattern?: string
  serial?: string
  serialCert?: string
}

export interface CustomerInfo {
  cusCode: string
  cusName: string
  cusAddress: string
  cusPhone?: string
  cusTaxCode?: string
}

export interface ProductInfo {
  prodName: string
  prodUnit?: string
  prodQuantity: number
  prodPrice: number
  amount: number
  vatRate: number
  vatAmount: number
  total: number
}

export interface InvoiceData {
  customer: CustomerInfo
  products: ProductInfo[]
  total: number
  vatAmount: number
  amount: number
  amountInWords: string
  paymentMethod?: string
  note?: string
  fkey: string
}

@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name)
  private readonly config: EInvoiceConfig
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.config = {
      baseUrl:
        this.configService.get('EINVOICE_BASE_URL') ||
        'https://h2o-tt78admindemo.vnpt-invoice.com.vn',
      account: this.configService.get('EINVOICE_ACCOUNT') || 'nguyenvana',
      acPass: this.configService.get('EINVOICE_AC_PASS') || 'Vnpt@1234',
      username: this.configService.get('EINVOICE_USERNAME') || 'nguyenvana',
      password: this.configService.get('EINVOICE_PASSWORD') || 'Vnpt@1234',
      pattern: '2/001',
      serial: 'C25MQC',
      serialCert:
        this.configService.get('EINVOICE_SERIAL_CERT') || '540101014D8A1505AC9C7DC132A98455'
    }
  }

  /**
   * BƯỚC 1: Lấy Base64Hash cho số hóa đơn cụ thể (GetHashInvMTTNoRangeByToken)
   * Theo tài liệu VNPT - API dành cho máy tính tiền
   */
  async getInvoiceHash(): Promise<{
    success: boolean
    base64Hash?: string
    error?: string
  }> {
    try {
      this.logger.log(`[STEP 1] Lấy hash cho số hóa đơn:`)

      console.log('****this.config****', this.config)

      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
          xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetHashInvMTTNoRangeByToken xmlns="http://tempuri.org/">
              <Account>${this.config.account}</Account>
              <ACpass>${this.config.acPass}</ACpass>
              <username>${this.config.username}</username>
              <password>${this.config.password}</password>
              <pattern>${this.config.pattern}</pattern>
              <serial>${this.config.serial}</serial>
              <serialCert>${this.config.serialCert}</serialCert>
            </GetHashInvMTTNoRangeByToken>
          </soap:Body>
        </soap:Envelope>`

      const response = await this.httpService.axiosRef.post(
        `${this.config.baseUrl}/businessservice.asmx`,
        soapBody,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: '"http://tempuri.org/GetHashInvMTTNoRangeByToken"'
          },
          timeout: 60000
        }
      )

      console.log('****response****', response.data)

      const responseData = response.data
      this.logger.log(`[STEP 1] Response length: ${responseData.length}`)

      if (typeof responseData === 'string') {
        const match = responseData.match(
          /<GetHashInvMTTNoRangeByTokenResult>(.*?)<\/GetHashInvMTTNoRangeByTokenResult>/s
        )

        if (match) {
          const result = match[1].trim()

          if (result.startsWith('ERR:')) {
            const errorCode = result.substring(4)
            const errorMessage = this.getErrorMessage(errorCode)
            this.logger.error(`[STEP 1] Lỗi: ERR:${errorCode} - ${errorMessage}`)

            return {
              success: false,
              error: `ERR:${errorCode} - ${errorMessage}`
            }
          } else if (result.length > 0) {
            this.logger.log(`[STEP 1] ✅ Lấy hash thành công, length: ${result.length}`)

            return {
              success: true,
              base64Hash: result
            }
          }
        }
      }

      return {
        success: false,
        error: 'Không thể parse response từ VNPT'
      }
    } catch (error) {
      this.logger.error(`[STEP 1] Lỗi kết nối VNPT:`, error.message)
      return {
        success: false,
        error: `Lỗi kết nối: ${error.message}`
      }
    }
  }

  /**
   * BƯỚC 2: Gửi hóa đơn điện tử đến CQT (SendInvMTTNoRangeByToken)
   * Theo tài liệu VNPT - Gửi hóa đơn đã ký số đến cơ quan thuế
   */
  async sendInvoiceToTax(orderData: {
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
  }): Promise<{
    success: boolean
    messageId?: string
    invoiceNumber?: string
    error?: string
  }> {
    try {
      const { orderId, invoiceNo, total, customerName, customerAddress, products } = orderData

      this.logger.log(`[STEP 2] Bắt đầu gửi hóa đơn ${invoiceNo} cho đơn hàng ${orderId}`)

      // Bước 2.1: Lấy Base64Hash từ bước 1
      const hashResult = await this.getInvoiceHash()
      if (!hashResult.success) {
        return {
          success: false,
          error: `Không thể lấy hash: ${hashResult.error}`
        }
      }

      // Bước 2.2: Ký số Base64Hash (demo mode)
      const signValue = await this.signHash(hashResult.base64Hash)
      this.logger.log(`[STEP 2] Đã ký hash, signature length: ${signValue.length}`)

      // Bước 2.3: Tạo XML hóa đơn hoàn chỉnh
      const invoiceXML = this.createInvoiceXML({
        orderId,
        invoiceNo,
        total,
        customerName: customerName || 'Khách lẻ',
        customerAddress: customerAddress || 'Không xác định',
        products: products || [{ name: 'Sản phẩm test', quantity: 1, price: total, total: total }]
      })

      // Bước 2.4: Tạo XML cuối cùng với Base64Hash và SignValue
      const finalXML = `<SendInv>
        <Base64Hash>${hashResult.base64Hash}</Base64Hash>
        <SignValue>${signValue}</SignValue>
        ${invoiceXML}
      </SendInv>`

      // Bước 2.5: Gửi đến CQT qua SOAP
      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
          xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <SendInvMTTNoRangeByToken xmlns="http://tempuri.org/">
              <Account>${this.config.account}</Account>
              <ACpass>${this.config.acPass}</ACpass>
              <username>${this.config.username}</username>
              <password>${this.config.password}</password>
              <pattern>${this.config.pattern}</pattern>
              <serial>${this.config.serial}</serial>
              <xml>${this.escapeXML(finalXML)}</xml>
            </SendInvMTTNoRangeByToken>
          </soap:Body>
        </soap:Envelope>`

      const response = await this.httpService.axiosRef.post(
        `${this.config.baseUrl}/businessservice.asmx`,
        soapBody,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: '"http://tempuri.org/SendInvMTTNoRangeByToken"'
          },
          timeout: 60000
        }
      )

      const responseData = response.data
      this.logger.log(`[STEP 2] Send response length: ${responseData.length}`)

      if (typeof responseData === 'string') {
        const match = responseData.match(
          /<SendInvMTTNoRangeByTokenResult>(.*?)<\/SendInvMTTNoRangeByTokenResult>/s
        )

        if (match) {
          const result = match[1].trim()

          if (result.startsWith('OK:')) {
            // Thành công: OK:mtd hoặc OK:messageId
            const messageId = result.substring(3)
            this.logger.log(`[STEP 2] ✅ Gửi hóa đơn thành công: ${messageId}`)

            return {
              success: true,
              messageId: messageId,
              invoiceNumber: invoiceNo.toString()
            }
          } else if (result.startsWith('ERR:')) {
            const errorCode = result.substring(4)
            const errorMessage = this.getErrorMessage(errorCode)
            this.logger.error(`[STEP 2] Lỗi gửi hóa đơn: ERR:${errorCode} - ${errorMessage}`)

            return {
              success: false,
              error: `ERR:${errorCode} - ${errorMessage}`
            }
          }
        }
      }

      return {
        success: false,
        error: 'Phản hồi không xác định từ server VNPT'
      }
    } catch (error) {
      this.logger.error(`[STEP 2] Lỗi gửi hóa đơn:`, error.message)
      return {
        success: false,
        error: `Lỗi kết nối: ${error.message}`
      }
    }
  }

  /**
   * Hàm ký số Base64Hash (Demo mode - trong thực tế cần SDK Token/SmartCA)
   */
  private async signHash(base64Hash: string): Promise<string> {
    // DEMO MODE: Tạo signature giả
    // Trong thực tế, cần tích hợp SDK Token/SmartCA từ VNPT
    const timestamp = Date.now()
    const demoSignature = `DEMO_SIGN_${timestamp}_${base64Hash.substring(0, 20)}`

    this.logger.log(`[DEMO] Đã ký hash với signature demo`)

    // TODO: Thay thế bằng logic ký số thực tế
    // const realSignature = await tokenSDK.signHash(base64Hash)

    return demoSignature
  }

  /**
   * Tạo XML hóa đơn cho test
   */
  private createInvoiceXML(data: {
    orderId: string
    invoiceNo: number
    total: number
    customerName: string
    customerAddress: string
    products: Array<{
      name: string
      quantity: number
      price: number
      total: number
    }>
  }): string {
    const currentDate = new Date().toISOString().split('T')[0]
    const currentYear = new Date().getFullYear().toString().slice(-2)
    const mccqt = `M1${currentYear}VNPT9${Date.now().toString().slice(-11)}`

    const productsXML = data.products
      .map(
        product => `
      <Product>
        <ProdName>${this.escapeXML(product.name)}</ProdName>
        <ProdUnit>Phần</ProdUnit>
        <ProdQuantity>${product.quantity}</ProdQuantity>
        <ProdPrice>${product.price}</ProdPrice>
        <Amount>${product.price * product.quantity}</Amount>
        <VATRate>10</VATRate>
        <VATAmount>${product.price * product.quantity * 0.1}</VATAmount>
        <Total>${product.total}</Total>
      </Product>
    `
      )
      .join('')

    const amount = data.total / 1.1 // Giá trước thuế
    const vatAmount = data.total - amount // Thuế VAT

    return `<Invoices>
      <Inv>
        <key>${data.orderId}</key>
        <MCCQT>${mccqt}</MCCQT>
        <Invoice>
          <CusCode>KH001</CusCode>
          <CusName>${this.escapeXML(data.customerName)}</CusName>
          <CusAddress>${this.escapeXML(data.customerAddress)}</CusAddress>
          <CusPhone></CusPhone>
          <CusTaxCode></CusTaxCode>
          <PaymentMethod>Tiền mặt</PaymentMethod>
          <KindOfService>Dịch vụ ăn uống</KindOfService>
          <TemplateNo></TemplateNo>
          <InvoiceNo>${data.invoiceNo}</InvoiceNo>
          <Products>
            ${productsXML}
          </Products>
          <Amount>${Math.round(amount)}</Amount>
          <VATRate>10</VATRate>
          <VATAmount>${Math.round(vatAmount)}</VATAmount>
          <Total>${data.total}</Total>
          <AmountInWords>${this.numberToWords(data.total)}</AmountInWords>
          <ArisingDate>${currentDate}</ArisingDate>
          <PaymentStatus>1</PaymentStatus>
          <Note>Hóa đơn test từ web bán hàng</Note>
        </Invoice>
      </Inv>
    </Invoices>`
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
   * Chuyển số thành chữ (đơn giản)
   */
  private numberToWords(amount: number): string {
    if (amount === 0) return 'Không đồng'

    const intAmount = Math.round(amount)
    if (intAmount < 1000) {
      return `${intAmount} đồng`
    } else if (intAmount < 1000000) {
      const thousands = Math.floor(intAmount / 1000)
      const remainder = intAmount % 1000
      if (remainder === 0) {
        return `${thousands} nghìn đồng`
      } else {
        return `${thousands} nghìn ${remainder} đồng`
      }
    } else {
      const millions = Math.floor(intAmount / 1000000)
      const remainder = intAmount % 1000000
      if (remainder === 0) {
        return `${millions} triệu đồng`
      } else {
        return `${millions} triệu ${remainder} đồng`
      }
    }
  }

  /**
   * Lấy thông báo lỗi từ VNPT
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages = {
      '1': 'Tài khoản đăng nhập sai hoặc không có quyền',
      '3': 'Dữ liệu XML đầu vào không đúng quy định',
      '5': 'Không phát hành được hóa đơn',
      '6': 'Không đủ số lượng hóa đơn để phát hành',
      '7': 'Thông tin Username/password không hợp lệ',
      '8': 'Từ số/Đến số truyền vào không hợp lệ',
      '9': 'Từ số không được lớn hơn Đến số',
      '10': 'Lô có số hóa đơn vượt quá số lượng cho phép',
      '11': 'Toàn bộ lô hóa đơn hoặc không tìm thấy hoặc đã gửi thuế',
      '13': 'Lỗi trùng Fkey',
      '20': 'Pattern và Serial không phù hợp',
      '21': 'Lỗi trùng số hóa đơn hoặc không tìm thấy công ty',
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
   * API Test: Tìm số hóa đơn khả dụng trong phạm vi 1 - 1000 (dải mới từ VNPT)
   */
  async findAvailableInvoiceNumber(): Promise<{
    success: boolean
    invoiceNumber?: number
    error?: string
  }> {
    // Phạm vi số hóa đơn mới từ VNPT: 0000001 đến 0001000
    // Pattern: 1/001, Serial: K25TCT
    const numbersToTry = [
      1, 2, 3, 4, 5, 10, 20, 30, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 950,
      999, 1000
    ]

    this.logger.log(
      `[FIND] Tìm số hóa đơn khả dụng trong dải mới 1-1000 (Pattern: 1/001, Serial: K25TCT)`
    )

    for (const number of numbersToTry) {
      const testResult = await this.getInvoiceHash()
      if (testResult.success) {
        this.logger.log(`[FIND] ✅ Tìm thấy số khả dụng: `)
        return {
          success: true,
          invoiceNumber: number
        }
      }
    }

    return {
      success: false,
      error: 'Không tìm thấy số hóa đơn khả dụng trong dải 1-1000 (Pattern: 1/001, Serial: K25TCT)'
    }
  }

  /**
   * API: Kiểm tra trạng thái hóa đơn theo messageId
   */
  async checkInvoiceStatus(messageId: string): Promise<{
    success: boolean
    status?: string
    statusText?: string
    invoiceNumber?: string
    error?: string
  }> {
    try {
      this.logger.log(`[CHECK] Kiểm tra trạng thái hóa đơn: ${messageId}`)

      // TODO: Trong thực tế, cần gọi API kiểm tra trạng thái từ VNPT
      // const soapBody = `<?xml version="1.0" encoding="utf-8"?>
      // <soap:Envelope>...CheckInvoiceStatus...</soap:Envelope>`

      // DEMO MODE: Trả về trạng thái giả
      const demoStatuses = [
        { status: '1', statusText: 'Đã gửi thành công đến CQT' },
        { status: '2', statusText: 'CQT đã tiếp nhận' },
        { status: '3', statusText: 'Hóa đơn hợp lệ' },
        { status: '4', statusText: 'Hóa đơn có lỗi' }
      ]

      const randomStatus = demoStatuses[Math.floor(Math.random() * demoStatuses.length)]

      this.logger.log(`[CHECK] ✅ Trạng thái demo: ${randomStatus.statusText}`)

      return {
        success: true,
        status: randomStatus.status,
        statusText: randomStatus.statusText,
        invoiceNumber: messageId.includes('_') ? messageId.split('_')[1] : 'N/A'
      }
    } catch (error) {
      this.logger.error(`[CHECK] Lỗi kiểm tra trạng thái:`, error.message)
      return {
        success: false,
        error: `Lỗi kiểm tra: ${error.message}`
      }
    }
  }
}
