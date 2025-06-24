import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

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
      pattern: this.configService.get('EINVOICE_PATTERN') || '1/007',
      serial: this.configService.get('EINVOICE_SERIAL') || 'K25TNS',
      serialCert:
        this.configService.get('EINVOICE_SERIAL_CERT') || '540101014D8A1505AC9C7DC132A98455'
    }
  }

  /**
   * Tạo XML data cho hóa đơn
   */
  private createInvoiceXML(invoiceData: InvoiceData): string {
    const {
      customer,
      products,
      total,
      vatAmount,
      amount,
      amountInWords,
      paymentMethod,
      note,
      fkey
    } = invoiceData

    // Tạo mã cơ quan thuế theo quy tắc
    const currentYear = new Date().getFullYear().toString().slice(-2)
    const mccqt = `M1${currentYear}VNPT9${Date.now().toString().slice(-11)}`

    const productsXML = products
      .map(
        product => `
            <Product>
                <ProdName>${this.escapeXML(product.prodName)}</ProdName>
                <ProdUnit>${product.prodUnit || 'Phần'}</ProdUnit>
                <ProdQuantity>${product.prodQuantity}</ProdQuantity>
                <ProdPrice>${product.prodPrice}</ProdPrice>
                <Amount>${product.amount}</Amount>
                <VATRate>${product.vatRate}</VATRate>
                <VATAmount>${product.vatAmount}</VATAmount>
                <Total>${product.total}</Total>
            </Product>`
      )
      .join('')

    return `<Invoices>
    <Inv>
        <key>${fkey}</key>
        <MCCQT>${mccqt}</MCCQT>
        <Invoice>
            <CusCode>${this.escapeXML(customer.cusCode)}</CusCode>
            <CusName>${this.escapeXML(customer.cusName)}</CusName>
            <CusAddress>${this.escapeXML(customer.cusAddress)}</CusAddress>
            <CusPhone>${customer.cusPhone || ''}</CusPhone>
            <CusTaxCode>${customer.cusTaxCode || ''}</CusTaxCode>
            <PaymentMethod>${this.escapeXML(paymentMethod || 'Tiền mặt')}</PaymentMethod>
            <KindOfService>Dịch vụ ăn uống</KindOfService>
            <TemplateNo></TemplateNo>
            <InvoiceNo></InvoiceNo>
            <Products>
                ${productsXML}
            </Products>
            <Amount>${amount}</Amount>
            <VATRate>10</VATRate>
            <VATAmount>${vatAmount}</VATAmount>
            <Total>${total}</Total>
            <AmountInWords>${this.escapeXML(amountInWords)}</AmountInWords>
            <ArisingDate>${new Date().toISOString().split('T')[0]}</ArisingDate>
            <PaymentStatus>1</PaymentStatus>
            <Note>${this.escapeXML(note || '')}</Note>
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
   * Chuyển số thành chữ (tiếng Việt) - phiên bản đơn giản
   */
  private numberToWords(amount: number): string {
    if (amount === 0) return 'Không đồng'

    // Làm tròn về số nguyên
    const intAmount = Math.round(amount)

    // Đơn giản hóa: chỉ trả về số + đồng, không dùng dấu chấm
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
   * Phát hành hóa đơn điện tử máy tính tiền (POS)
   * Sử dụng API chuyên biệt cho HĐĐT máy tính tiền
   */
  async publishInvoice(invoiceData: InvoiceData): Promise<{
    success: boolean
    invoiceNumber?: string
    pattern?: string
    serial?: string
    error?: string
  }> {
    try {
      console.log(invoiceData)

      // Bước 1: Lấy Base64Hash để ký số
      const hashResult = await this.getHashInvoice()

      console.log('*****Hash result:', hashResult)

      if (!hashResult.success) {
        return hashResult
      }

      // Bước 2: Gửi hóa đơn đã ký đến CQT
      // const sendResult = await this.sendInvoiceToTax(
      //   invoiceData,
      //   hashResult.base64Hash,
      //   hashResult.signValue
      // )

      // this.logger.debug('*****Send result:', sendResult)

      // return sendResult
      return {
        success: true,
        pattern: this.config.pattern,
        serial: this.config.serial,
        invoiceNumber: `TEST_${Date.now()}`
      }
    } catch (error) {
      this.logger.error('*****Error publishing e-invoice:', error)
      return {
        success: false,
        error: error.message || '*****Lỗi kết nối đến server hóa đơn điện tử'
      }
    }
  }

  /**
   * Bước 1: Lấy Base64Hash để ký số (API chuyên biệt cho máy tính tiền)
   */
  private async getHashInvoice(): Promise<{
    success: boolean
    base64Hash?: string
    signValue?: string
    error?: string
  }> {
    try {
      // Thử trực tiếp với range đầu tiên
      const result = await this.testSpecificRange(1, 1)

      if (result.success) {
        return {
          success: true,
          base64Hash: result.base64Hash,
          signValue: ''
        }
      } else {
        return {
          success: false,
          error: result.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Lỗi khi lấy hash hóa đơn'
      }
    }
  }

  /**
   * Bước 2: Gửi hóa đơn đã ký đến CQT (API chuyên biệt cho máy tính tiền)
   */
  private async sendInvoiceToTax(
    invoiceData: InvoiceData,
    base64Hash: string,
    signValue: string
  ): Promise<{
    success: boolean
    invoiceNumber?: string
    pattern?: string
    serial?: string
    error?: string
  }> {
    try {
      // Tạo XML với thông tin ký số
      const signedXML = this.createSignedInvoiceXML(invoiceData, base64Hash, signValue)

      console.log('***signedXML:', signedXML)

      // const response = await firstValueFrom(
      //   this.httpService.post(
      //     `${this.config.baseUrl}/businessservice.asmx/SendInvMTTNoRangeByToken`,
      //     {
      //       Account: this.config.account,
      //       ACpass: this.config.acPass,
      //       username: this.config.username,
      //       password: this.config.password,
      //       pattern: this.config.pattern,
      //       serial: this.config.serial,
      //       fromNo: 1,
      //       toNo: 1,
      //       xml: signedXML
      //     },
      //     {
      //       headers: {
      //         'Content-Type': 'application/x-www-form-urlencoded'
      //       },
      //       timeout: 30000
      //     }
      //   )
      // )

      // this.logger.log('Send invoice response:', response.data)

      // const result = response.data
      // if (result.startsWith('OK:')) {
      //   // Parse: OK:mtd hoặc OK:pattern;serial-key_invoiceNumber
      //   const parts = result.substring(3)
      //   if (parts === 'mtd') {
      //     // Thành công gửi đến CQT
      //     await this.saveInvoiceInfo(
      //       invoiceData.fkey,
      //       {
      //         pattern: this.config.pattern,
      //         serial: this.config.serial,
      //         invoiceNumber: `${this.config.pattern}-${Date.now()}`, // Tạm thời
      //         status: 'SENT'
      //       },
      //       signedXML,
      //       result
      //     )

      //     return {
      //       success: true,
      //       pattern: this.config.pattern,
      //       serial: this.config.serial,
      //       invoiceNumber: `${this.config.pattern}-${Date.now()}`
      //     }
      //   } else {
      //     // Parse chi tiết số hóa đơn
      //     const detailParts = parts.split(';')
      //     const pattern = detailParts[0]
      //     const serialAndNumber = detailParts[1]?.split('-')
      //     const serial = serialAndNumber[0]
      //     const keyAndNumber = serialAndNumber[1]?.split('_')
      //     const invoiceNumber = keyAndNumber[1]

      //     await this.saveInvoiceInfo(
      //       invoiceData.fkey,
      //       {
      //         pattern,
      //         serial,
      //         invoiceNumber,
      //         status: 'SENT'
      //       },
      //       signedXML,
      //       result
      //     )

      //     return {
      //       success: true,
      //       invoiceNumber,
      //       pattern,
      //       serial
      //     }
      //   }
      // } else if (result.startsWith('ERR:')) {
      //   const errorCode = result.substring(4)
      //   const errorMessage = this.getErrorMessage(errorCode)

      //   this.logger.error(`E-invoice send error: ${errorCode} - ${errorMessage}`)

      //   // Lưu lỗi vào database
      //   await this.saveInvoiceInfo(
      //     invoiceData.fkey,
      //     {
      //       pattern: this.config.pattern,
      //       serial: this.config.serial,
      //       invoiceNumber: '',
      //       status: 'REJECTED'
      //     },
      //     signedXML,
      //     result
      //   )

      //   return {
      //     success: false,
      //     error: errorMessage
      //   }
      // }

      return {
        success: false,
        error: 'Phản hồi không xác định từ server khi gửi hóa đơn'
      }
    } catch (error) {
      this.logger.error('Error sending invoice to tax authority:', error)
      return {
        success: false,
        error: error.message || 'Lỗi khi gửi hóa đơn đến cơ quan thuế'
      }
    }
  }

  /**
   * Tạo XML hóa đơn đã ký số
   */
  private createSignedInvoiceXML(
    invoiceData: InvoiceData,
    base64Hash: string,
    signValue: string
  ): string {
    const basicXML = this.createInvoiceXML(invoiceData)

    // Chèn thông tin ký số vào XML
    const signedXML = basicXML.replace(
      '</Invoice>',
      `
            <Base64Hash>${base64Hash}</Base64Hash>
            <SignValue>${signValue}</SignValue>
        </Invoice>`
    )

    return signedXML
  }
  /**
   * Lưu thông tin hóa đơn điện tử
   */
  private async saveInvoiceInfo(
    orderId: string,
    invoiceInfo: {
      pattern: string
      serial: string
      invoiceNumber: string
      status: string
    },
    xmlData?: string,
    responseData?: string
  ) {
    try {
      // TODO: Sử dụng sau khi Prisma client được generate
      /*
      await this.prisma.eInvoice.upsert({
        where: {
          orderId
        },
        create: {
          orderId,
          pattern: invoiceInfo.pattern,
          serial: invoiceInfo.serial,
          invoiceNumber: invoiceInfo.invoiceNumber,
          status: invoiceInfo.status as any,
          xmlData,
          responseData,
          publishedAt: invoiceInfo.status === 'SENT' ? new Date() : null
        },
        update: {
          pattern: invoiceInfo.pattern,
          serial: invoiceInfo.serial,
          invoiceNumber: invoiceInfo.invoiceNumber,
          status: invoiceInfo.status as any,
          xmlData,
          responseData,
          publishedAt: invoiceInfo.status === 'SENT' ? new Date() : null
        }
      })
      */

      // Temporary log until Prisma client is generated
      this.logger.log(`Saving invoice info for order: ${orderId}`, {
        pattern: invoiceInfo.pattern,
        serial: invoiceInfo.serial,
        invoiceNumber: invoiceInfo.invoiceNumber,
        status: invoiceInfo.status,
        xmlDataLength: xmlData?.length || 0,
        responseDataLength: responseData?.length || 0
      })
    } catch (error) {
      this.logger.error('Error saving invoice info:', error)
    }
  }

  /**
   * Lấy thông điệp lỗi
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
   * Tạo dữ liệu hóa đơn từ order
   */
  createInvoiceFromOrder(order: any, customer?: any): InvoiceData {
    const products: ProductInfo[] = order.orderDetails.map((detail: any) => {
      const priceBeforeVat = detail.product.price
      const quantity = detail.amount
      const amountBeforeVat = priceBeforeVat * quantity
      const vatAmount = amountBeforeVat * 0.1 // 10% VAT
      const totalAfterVat = amountBeforeVat + vatAmount

      return {
        prodName: detail.product.name,
        prodUnit: 'Phần',
        prodQuantity: quantity,
        prodPrice: priceBeforeVat,
        amount: amountBeforeVat, // Giá trị trước thuế
        vatRate: 10,
        vatAmount: vatAmount,
        total: totalAfterVat // Giá trị sau thuế
      }
    })

    const amount = products.reduce((sum, p) => sum + p.amount, 0) // Tổng trước thuế
    const vatAmount = products.reduce((sum, p) => sum + p.vatAmount, 0) // Tổng thuế
    const total = amount + vatAmount // Tổng sau thuế

    return {
      customer: {
        cusCode: customer?.code || order.customerId || 'KH001',
        cusName: customer?.name || order.customer?.name || 'Khách lẻ',
        cusAddress: customer?.address || order.customer?.address || 'Không xác định',
        cusPhone: customer?.phone || order.customer?.phone,
        cusTaxCode: customer?.taxCode || order.customer?.taxCode
      },
      products,
      total, // Tổng sau thuế
      vatAmount, // Tổng thuế VAT
      amount, // Tổng trước thuế (khác với total)
      amountInWords: this.numberToWords(total), // Chuyển total thành chữ
      paymentMethod: order.paymentMethod?.name || 'Tiền mặt',
      note: order.note,
      fkey: order.id || `ORDER_${Date.now()}`
    }
  }

  /**
   * Test kết nối đến VNPT API
   */
  async testConnection(): Promise<{
    success: boolean
    message: string
    endpoints: {
      publishService: boolean
      businessService: boolean
      portalService: boolean
    }
  }> {
    const endpoints = {
      publishService: false,
      businessService: false,
      portalService: false
    }

    try {
      // Test BusinessService endpoint (chính cho POS)
      try {
        const businessResponse = await firstValueFrom(
          this.httpService.get(`${this.config.baseUrl}/businessservice.asmx`, {
            timeout: 10000
          })
        )
        endpoints.businessService = businessResponse.status === 200
      } catch (error) {
        this.logger.warn('BusinessService endpoint not accessible:', error.message)
      }

      // Test PublishService endpoint
      try {
        const publishResponse = await firstValueFrom(
          this.httpService.get(`${this.config.baseUrl}/publishservice.asmx`, {
            timeout: 10000
          })
        )
        endpoints.publishService = publishResponse.status === 200
      } catch (error) {
        this.logger.warn('PublishService endpoint not accessible:', error.message)
      }

      // Test PortalService endpoint
      try {
        const portalResponse = await firstValueFrom(
          this.httpService.get(`${this.config.baseUrl}/portalservice.asmx`, {
            timeout: 10000
          })
        )
        endpoints.portalService = portalResponse.status === 200
      } catch (error) {
        this.logger.warn('PortalService endpoint not accessible:', error.message)
      }

      const successCount = Object.values(endpoints).filter(Boolean).length
      const totalCount = Object.keys(endpoints).length

      return {
        success: successCount > 0,
        message: `Connected to ${successCount}/${totalCount} VNPT endpoints`,
        endpoints
      }
    } catch (error) {
      this.logger.error('Error testing VNPT connection:', error)
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        endpoints
      }
    }
  }

  /**
   * Kiểm tra trạng thái Pattern/Serial
   */
  async checkPatternSerialStatus(): Promise<{
    success: boolean
    message: string
    data?: any
  }> {
    try {
      // Gọi hàm kiểm tra với range rất nhỏ để test
      const testResult = await this.getHashInvoice()

      if (testResult.success) {
        return {
          success: true,
          message: 'Pattern/Serial hợp lệ và còn số hóa đơn',
          data: {
            pattern: this.config.pattern,
            serial: this.config.serial,
            serialCert: this.config.serialCert,
            base64Hash: testResult.base64Hash?.substring(0, 50) + '...' // Chỉ hiển thị 50 ký tự đầu
          }
        }
      } else {
        return {
          success: false,
          message: `Pattern/Serial có vấn đề: ${testResult.error}`,
          data: {
            pattern: this.config.pattern,
            serial: this.config.serial,
            serialCert: this.config.serialCert,
            error: testResult.error
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Lỗi khi kiểm tra Pattern/Serial: ${error.message}`,
        data: {
          pattern: this.config.pattern,
          serial: this.config.serial,
          serialCert: this.config.serialCert
        }
      }
    }
  }

  /**
   * Tìm range số hóa đơn khả dụng
   */
  async findAvailableInvoiceRange(): Promise<{
    success: boolean
    availableRange?: { fromNo: number; toNo: number }
    message: string
    testedRanges?: Array<{ fromNo: number; toNo: number; error: string }>
  }> {
    const testedRanges: Array<{ fromNo: number; toNo: number; error: string }> = []

    // Thử các range khác nhau
    const testRanges = [
      { fromNo: 1, toNo: 1 },
      { fromNo: 2, toNo: 2 },
      { fromNo: 3, toNo: 3 },
      { fromNo: 10, toNo: 10 },
      { fromNo: 50, toNo: 50 },
      { fromNo: 100, toNo: 100 },
      { fromNo: 1000, toNo: 1000 },
      { fromNo: 9999, toNo: 9999 },
      { fromNo: 10000, toNo: 10000 },
      { fromNo: 50000, toNo: 50000 }
    ]

    for (const range of testRanges) {
      try {
        const result = await this.testSpecificRange(range.fromNo, range.toNo)

        if (result.success) {
          return {
            success: true,
            availableRange: range,
            message: `Tìm thấy range khả dụng: ${range.fromNo}-${range.toNo}`,
            testedRanges
          }
        } else {
          testedRanges.push({
            fromNo: range.fromNo,
            toNo: range.toNo,
            error: result.error || 'Unknown error'
          })
        }
      } catch (error) {
        testedRanges.push({
          fromNo: range.fromNo,
          toNo: range.toNo,
          error: error.message
        })
      }
    }

    return {
      success: false,
      message: 'Không tìm thấy range số hóa đơn khả dụng',
      testedRanges
    }
  }

  /**
   * Test một range số cụ thể
   */
  private async testSpecificRange(
    fromNo: number,
    toNo: number
  ): Promise<{
    success: boolean
    error?: string
    base64Hash?: string
  }> {
    try {
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
      <fromNo>${fromNo}</fromNo>
      <toNo>${toNo}</toNo>
      <serialCert>${this.config.serialCert}</serialCert>
    </GetHashInvMTTNoRangeByToken>
  </soap:Body>
</soap:Envelope>`

      const response = await firstValueFrom(
        this.httpService.post(`${this.config.baseUrl}/businessservice.asmx`, soapBody, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: '"http://tempuri.org/GetHashInvMTTNoRangeByToken"'
          },
          timeout: 10000
        })
      )

      const result = response.data

      if (typeof result === 'string') {
        // Kiểm tra SOAP Fault
        if (result.includes('<soap:Fault>')) {
          const faultMatch = result.match(/<faultstring>(.*?)<\/faultstring>/s)
          if (faultMatch) {
            return {
              success: false,
              error: faultMatch[1]
            }
          }
        }

        // Extract kết quả
        const match = result.match(
          /<GetHashInvMTTNoRangeByTokenResponse[^>]*>(.*?)<\/GetHashInvMTTNoRangeByTokenResponse>/s
        )
        if (match) {
          const responseContent = match[1]
          const resultMatch = responseContent.match(
            /<GetHashInvMTTNoRangeByTokenResult>(.*?)<\/GetHashInvMTTNoRangeByTokenResult>/s
          )

          if (resultMatch) {
            const actualResult = resultMatch[1].trim()

            if (actualResult.startsWith('ERR:')) {
              const errorCode = actualResult.substring(4)
              return {
                success: false,
                error: this.getErrorMessage(errorCode)
              }
            } else {
              return {
                success: true,
                base64Hash: actualResult
              }
            }
          }
        }
      }

      return {
        success: false,
        error: 'Phản hồi không xác định'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}
