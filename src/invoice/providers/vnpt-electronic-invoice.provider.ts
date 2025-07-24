import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import axios from 'axios'
import { decrypt } from 'utils/encrypt'
import {
  BaseElectronicInvoiceProvider,
  ElectronicInvoiceProvider,
  ElectronicInvoiceResponse,
  InvoiceWithRelations,
  ElectronicInvoiceData
} from './base-electronic-invoice.provider'

// VNPT specific configuration interface
interface VNPTConfig extends ElectronicInvoiceProvider {
  config?: {
    id: string
    providerId: string
    vnptApiUrl: string
    vnptLookupUrl?: string
    vnptUsername: string
    vnptPassword: string
    vnptAccount: string
    vnptAccountPassword: string
    invPattern: string
    invSerial: string
  }
}

@Injectable()
export class VNPTElectronicInvoiceProvider extends BaseElectronicInvoiceProvider {
  providerType = 'VNPT'
  providerName = 'VNPT Invoice'

  /**
   * Export electronic invoice to VNPT
   */
  async exportInvoice(
    provider: ElectronicInvoiceProvider,
    invoice: InvoiceWithRelations
  ): Promise<ElectronicInvoiceResponse> {
    try {
      // Validate and cast provider config
      const vnptProvider = this.validateAndCastProvider(provider)

      // Prepare invoice data
      const invoiceData = this.prepareInvoiceData(invoice)

      // Create SOAP envelope
      const soapEnvelope = this.createSOAPEnvelope(vnptProvider, invoiceData)

      // Call VNPT API
      const response = await this.callVNPTSOAPAPI(vnptProvider, soapEnvelope)

      // Return our custom lookupKey as fkey instead of VNPT's generated key
      return {
        success: response.success,
        invoiceId: response.invoiceId,
        fkey: invoice.lookupKey || response.fkey, // Use our lookupKey as fkey
        error: response.error,
        rawResponse: response.rawResponse,
        providerType: this.providerType
      }
    } catch (error) {
      throw new HttpException('Có lỗi xảy ra khi xuất hóa đơn điện tử VNPT', HttpStatus.BAD_REQUEST)
    }
  }

  /**
   * Download invoice PDF from VNPT
   */
  async downloadInvoicePDF(fkey: string, provider: ElectronicInvoiceProvider): Promise<Buffer> {
    try {
      const vnptProvider = this.validateAndCastProvider(provider)
      const config = vnptProvider.config!

      // Safely decrypt password
      const userPassword = config.vnptPassword ? decrypt(config.vnptPassword) : ''
      const accountPassword = config.vnptAccountPassword ? decrypt(config.vnptAccountPassword) : ''

      // Use VNPT base URL for PDF download
      const vnptBaseUrl = config.vnptApiUrl

      const response = await axios.get(
        `${vnptBaseUrl}/services/InvoiceAPI/InvoiceWS/downloadInvPDFFkeyNoPay`,
        {
          params: {
            fkey: fkey,
            username: config.vnptUsername,
            password: userPassword
          },
          headers: {
            Authorization: `Basic ${Buffer.from(`${config.vnptAccount}:${accountPassword}`).toString('base64')}`
          },
          responseType: 'arraybuffer'
        }
      )

      return response.data
    } catch (error) {
      throw new HttpException('Không thể tải xuống file PDF hóa đơn VNPT', HttpStatus.BAD_REQUEST)
    }
  }
  /**
   * Validate VNPT provider configuration
   */
  validateConfig(provider: ElectronicInvoiceProvider): boolean {
    try {
      const vnptProvider = provider as VNPTConfig
      const config = vnptProvider.config

      if (!config) {
        return false
      }

      const requiredFields = ['vnptApiUrl', 'vnptUsername', 'invPattern', 'invSerial']

      const missingFields = requiredFields.filter(field => !config[field])

      if (missingFields.length > 0) {
        return false
      }

      // Check if passwords exist (they might be encrypted or empty)
      if (!config.vnptPassword && !config.vnptAccountPassword) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get VNPT specific error message
   */
  getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      '1': 'Tài khoản đăng nhập sai hoặc không có quyền thêm mới hóa đơn',
      '2': 'Pattern hoặc serial truyền vào rỗng',
      '3': 'Dữ liệu xml đầu vào không đúng quy định',
      '4': 'Không lấy được thông tin công ty (currentCompany null)',
      '5': 'Không phát hành được hóa đơn',
      '6': 'Không đủ số lượng hóa đơn cho lô thêm mới',
      '7': 'User name không phù hợp, không tìm thấy user',
      '10': 'Lô có số hóa đơn vượt quá max cho phép',
      '11': 'Pattern hoặc serial không đúng định dạng',
      '13': 'Danh sách hóa đơn tồn tại hóa đơn trùng Fkey',
      '15': 'Ngày lập truyền vào lớn hơn ngày hiện tại hoặc XML không đúng định dạng (hóa đơn ngoại tệ không truyền tỷ giá)',
      '20': 'Pattern và serial không phù hợp, hoặc không tồn tại hóa đơn đã đăng ký có sử dụng Pattern và Serial truyền vào',
      '21': 'Trùng số hóa đơn',
      '22': 'Thông tin người bán vượt maxlength',
      '23': 'Mã CQT rỗng',
      '30': 'Danh sách hóa đơn tồn tại ngày hóa đơn nhỏ hơn ngày hóa đơn đã phát hành'
    }

    return errorMessages[errorCode] || `Lỗi không xác định (Mã: ${errorCode})`
  }

  // === PRIVATE METHODS ===

  private validateAndCastProvider(provider: ElectronicInvoiceProvider): VNPTConfig {
    if (provider.providerType !== this.providerType) {
      throw new Error(
        `Provider type mismatch. Expected: ${this.providerType}, Got: ${provider.providerType}`
      )
    }

    const vnptProvider = provider as VNPTConfig
    if (!vnptProvider.config) {
      throw new Error('VNPT configuration is missing')
    }

    return vnptProvider
  }
  private createSOAPEnvelope(provider: VNPTConfig, invoiceData: ElectronicInvoiceData): string {
    const xmlInvData = this.createInvoiceXML(invoiceData)
    const config = provider.config!

    // Safely decrypt passwords with null checks
    const accountPassword = config.vnptAccountPassword ? decrypt(config.vnptAccountPassword) : ''
    const userPassword = config.vnptPassword ? decrypt(config.vnptPassword) : ''

    return `<?xml version="1.0" encoding="UTF-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <ImportAndPublishInvMTT xmlns="http://tempuri.org/">
                <Account>${config.vnptAccount}</Account>
                <ACpass>${accountPassword}</ACpass>
                <xmlInvData>
                    <![CDATA[${xmlInvData}]]>
                </xmlInvData>
                <username>${config.vnptUsername}</username>
                <password>${userPassword}</password>
                <pattern>${config.invPattern}</pattern>
                <serial>${config.invSerial}</serial>
                <convert>0</convert>
                </ImportAndPublishInvMTT>
            </soap:Body>
            </soap:Envelope>`
  }

  private createInvoiceXML(data: ElectronicInvoiceData): string {
    // Group items by VAT rate for summary
    const vatGroups: { [key: number]: { totalAmount: number; vatAmount: number } } = {}

    const itemsXML = data.items
      .map(item => {
        // Group VAT for summary
        if (item.vatRate > 0) {
          if (!vatGroups[item.vatRate]) {
            vatGroups[item.vatRate] = { totalAmount: 0, vatAmount: 0 }
          }
          vatGroups[item.vatRate].totalAmount += item.totalAmount
          vatGroups[item.vatRate].vatAmount += item.vatAmount
        }

        return `
            <HHDVu>
                <TChat>1</TChat>
                <STT>${item.stt}</STT>
                <MHHDVu>${item.productCode}</MHHDVu>
                <THHDVu>${item.productName}</THHDVu>
                <DVTinh>${item.unit}</DVTinh>
                <SLuong>${item.quantity}</SLuong>
                <DGia>${item.unitPrice}</DGia>
                <ThTien>${item.totalAmount}</ThTien>
                ${
                  item.vatRate > 0
                    ? `<TSuat>${item.vatRate}</TSuat>
                <TThue>${item.vatAmount}</TThue>
                <TSThue>${item.totalAmount + item.vatAmount}</TSThue>`
                    : ''
                }
            </HHDVu>`
      })
      .join('')

    // Create VAT rate summary if there are items with VAT
    const vatSummaryXML =
      Object.keys(vatGroups).length > 0
        ? `<THTTLTSuat>
            ${Object.entries(vatGroups)
              .map(
                ([rate, group]) => `
                <LTSuat>
                    <TSuat>${rate}</TSuat>
                    <ThTien>${group.totalAmount}</ThTien>
                    <TThue>${group.vatAmount}</TThue>
                </LTSuat>`
              )
              .join('')}
        </THTTLTSuat>`
        : ''

    return `<DSHDon>
                <HDon>
                    <key>${data.key}</key>
                    <DLHDon>
                        <TTChung>
                            <NLap>${data.invoiceDate}</NLap>
                            <DVTTe>${data.currency}</DVTTe>
                            <HTTToan>${data.paymentMethod}</HTTToan>
                            <TTKhac>
                                <TTin>
                                    <TTruong>Source</TTruong>
                                    <KDLieu>string</KDLieu>
                                    <DLieu>MTT</DLieu>
                                </TTin>
                            </TTKhac>
                        </TTChung>
                        <NDHDon>                            <NMua>
                                <Ten>${data.buyerInfo.name}</Ten>
                                ${data.buyerInfo.taxCode ? `<MST>${data.buyerInfo.taxCode}</MST>` : ''}
                                ${data.buyerInfo.phone ? `<SDThoai>${data.buyerInfo.phone}</SDThoai>` : ''}
                                ${data.buyerInfo.cardId ? `<CCCDan>${data.buyerInfo.cardId}</CCCDan>` : ''}
                                ${data.buyerInfo.email ? `<DCTDTu>${data.buyerInfo.email}</DCTDTu>` : ''}
                                ${data.buyerInfo.passport ? `<SHCC>${data.buyerInfo.passport}</SHCC>` : ''}
                                <MKHang></MKHang>
                                <DChi>${data.buyerInfo.address}</DChi>
                            </NMua>
                            <DSHHDVu>${itemsXML}
                            </DSHHDVu>
                            <TToan>
                                ${vatSummaryXML}
                                <TgTCThue>${data.totalInfo.totalBeforeTax}</TgTCThue>
                                ${data.totalInfo.totalTax > 0 ? `<TgTThue>${data.totalInfo.totalTax}</TgTThue>` : ''}
                                <TTCKTMai>${data.totalInfo.totalAfterTax - data.totalInfo.totalBeforeTax - (data.totalInfo.totalTax || 0)}</TTCKTMai>
                                <TgTTTBSo>${data.totalInfo.totalAfterTax}</TgTTTBSo>
                                <TgTTTBChu>${data.totalInfo.totalInWords}</TgTTTBChu>
                            </TToan>
                        </NDHDon>
                    </DLHDon>
                </HDon>
            </DSHDon>`
  }

  private async callVNPTSOAPAPI(provider: VNPTConfig, soapEnvelope: string) {
    try {
      const config = provider.config!

      // Use VNPT API endpoint
      const vnptApiUrl = `${config.vnptApiUrl}/publishservice.asmx`

      const response = await axios.post(vnptApiUrl, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'http://tempuri.org/ImportAndPublishInvMTT'
        }
      })

      // Parse SOAP response
      const responseData = this.parseSOAPResponse(response.data)

      return {
        success: responseData.success,
        invoiceId: responseData.success ? responseData.invoiceId || null : null,
        fkey: responseData.success ? responseData.fkey || null : null,
        error: responseData.error,
        rawResponse: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Lỗi kết nối API VNPT',
        rawResponse: null
      }
    }
  }

  private parseSOAPResponse(soapResponse: string) {
    try {
      // Look for ImportAndPublishInvMTTResult tag
      if (soapResponse.includes('<ImportAndPublishInvMTTResult>')) {
        const resultMatch = soapResponse.match(
          /<ImportAndPublishInvMTTResult>(.*?)<\/ImportAndPublishInvMTTResult>/s
        )

        if (resultMatch) {
          const resultData = resultMatch[1].trim()

          // Check for success response (starts with OK:)
          if (resultData.startsWith('OK:')) {
            const parts = resultData.split(';')
            const statusPart = parts[0] // OK:1/004
            const fkeyPart = parts[1] || '' // FKEY

            const invoiceIdMatch = statusPart.match(/OK:(.+)/)
            const invoiceId = invoiceIdMatch ? invoiceIdMatch[1] : null

            return {
              success: true,
              invoiceId: invoiceId,
              fkey: fkeyPart,
              error: null
            }
          }
          // Check for error response (starts with ERR:)
          else if (resultData.startsWith('ERR:')) {
            let errorCode = ''
            let detailMessage = ''

            if (resultData.includes(' err:')) {
              const parts = resultData.split(' err:')
              errorCode = parts[0].replace('ERR:', '')
              detailMessage = parts[1] || ''
            } else {
              errorCode = resultData.replace('ERR:', '')
            }

            const errorMessage = this.getErrorMessage(errorCode)
            const fullErrorMessage = detailMessage
              ? `${errorMessage} - Chi tiết: ${detailMessage}`
              : errorMessage

            return {
              success: false,
              invoiceId: null,
              fkey: null,
              error: `ERR:${errorCode} - ${fullErrorMessage}`
            }
          }
        }
      }

      return {
        success: false,
        error: 'Không thể parse response từ VNPT',
        invoiceId: null,
        fkey: null
      }
    } catch (error) {
      return {
        success: false,
        error: 'Lỗi khi xử lý response từ VNPT',
        invoiceId: null,
        fkey: null
      }
    }
  }
}
