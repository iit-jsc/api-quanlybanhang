import { Invoice, InvoiceDetail } from '@prisma/client'

// Base interfaces for all electronic invoice providers
export interface ElectronicInvoiceProvider {
  providerType: string
  providerName: string
  isActive: boolean
  config?: ElectronicInvoiceConfig
}

export interface ElectronicInvoiceConfig {
  id: string
  providerId: string
  apiUrl?: string
  username?: string
  password?: string
  [key: string]: any // For provider-specific configurations
}

// Common invoice data structure
export interface ElectronicInvoiceData {
  key: string
  buyerInfo: {
    name: string
    taxCode?: string
    address: string
    phone?: string
    email?: string
    contactPerson?: string
    cardId?: string
    passport?: string
    bankName?: string
    bankCode?: string
  }
  items: Array<{
    stt: number
    productCode?: string
    productName: string
    unit?: string
    quantity?: number
    unitPrice?: number
    totalAmount: number
    vatRate: number
    vatAmount: number
  }>
  totalInfo: {
    totalBeforeTax: number
    totalTax: number
    totalAfterTax: number
    totalInWords: string
  }
  invoiceDate: string
  currency: string
  paymentMethod: string
}

// Common response structure
export interface ElectronicInvoiceResponse {
  success: boolean
  invoiceId?: string
  fkey?: string
  error?: string
  rawResponse?: any
  providerType?: string
}

// Invoice with relations for providers - simplified to use direct data from DTO
export interface InvoiceWithRelations extends Invoice {
  // Use invoice data directly from DTO instead of relying on order relations
  invoiceDetails?: Array<InvoiceDetail>
}

// Product information interface
export interface ProductInfo {
  name?: string
  code?: string
  price?: number
  measurementUnit?: {
    name?: string
  }
  vatGroup?: {
    vatRate?: number
  }
}

// Abstract base class for electronic invoice providers
export abstract class BaseElectronicInvoiceProvider {
  abstract providerType: string
  abstract providerName: string
  /**
   * Export electronic invoice
   */
  abstract exportInvoice(
    provider: ElectronicInvoiceProvider,
    invoice: InvoiceWithRelations
  ): Promise<ElectronicInvoiceResponse>

  /**
   * Download invoice PDF
   */
  abstract downloadInvoicePDF?(fkey: string, provider: ElectronicInvoiceProvider): Promise<Buffer>

  /**
   * Validate provider configuration
   */
  abstract validateConfig(provider: ElectronicInvoiceProvider): boolean

  /**
   * Get provider-specific error message
   */
  abstract getErrorMessage(errorCode: string): string

  /**
   * Prepare invoice data from invoice with relations
   */
  protected prepareInvoiceData(invoice: InvoiceWithRelations): ElectronicInvoiceData {
    const invoiceDetails = invoice.invoiceDetails || []

    // Prepare items from invoice details - use data directly from invoice
    const items = invoiceDetails.map((detail, index: number) => {
      const unitPrice = detail.unitPrice
      const quantity = detail.amount
      const totalAmount = unitPrice * quantity
      const vatRate = detail.vatRate || 0
      const vatAmount = (totalAmount * vatRate) / 100

      return {
        stt: index + 1,
        productCode: detail.productCode || '',
        productName: detail.productName || 'Sản phẩm',
        unit: detail.unit || '',
        quantity: quantity,
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        vatRate: vatRate,
        vatAmount: vatAmount
      }
    })

    // Convert number to words
    const totalInWords = this.convertNumberToWords(invoice.totalAfterTax || 0)

    // Generate shorter key: IITPOS-HD{invoiceId}-{3 digit random}
    // const shortInvoiceId = invoice.id.split('-')[0] // Take first part of UUID
    const key = invoice.id

    return {
      key: key,
      buyerInfo: {
        name: invoice.customerName || 'Khách lẻ',
        taxCode: invoice.customerTaxCode || '',
        address: invoice.customerAddress || '',
        phone: invoice.customerPhone || '',
        email: invoice.customerEmail || '',
        contactPerson: invoice.originalName || invoice.customerName || 'Khách hàng',
        cardId: invoice.customerCardId || '',
        passport: invoice.passport || '',
        bankName: invoice.customerBankName || '',
        bankCode: invoice.customerBankCode || ''
      },
      items: items,
      totalInfo: {
        totalBeforeTax: invoice.totalBeforeTax || 0,
        totalTax: invoice.totalTax || 0,
        totalAfterTax: invoice.totalAfterTax || 0,
        totalInWords: totalInWords
      },
      invoiceDate: new Date().toISOString().split('T')[0],
      currency: 'VND',
      paymentMethod: 'TM' // Default to cash
    }
  }

  /**
   * Convert number to Vietnamese words
   */
  protected convertNumberToWords(number: number): string {
    if (number === 0) return 'Không đồng'

    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
    const tens = [
      '',
      '',
      'hai mươi',
      'ba mươi',
      'bốn mươi',
      'năm mươi',
      'sáu mươi',
      'bảy mươi',
      'tám mươi',
      'chín mươi'
    ]

    if (number < 1000000) {
      if (number >= 100000) {
        const hundreds = Math.floor(number / 100000)
        const remainder = number % 100000
        let result = ones[hundreds] + ' trăm'
        if (remainder >= 1000) {
          const thousands = Math.floor(remainder / 1000)
          if (thousands > 0) {
            result += ' ' + ones[thousands] + ' nghìn'
          }
          const lastPart = remainder % 1000
          if (lastPart > 0) {
            if (lastPart < 100) {
              result +=
                ' ' +
                (lastPart < 10
                  ? 'lẻ ' + ones[lastPart]
                  : tens[Math.floor(lastPart / 10)] +
                    (lastPart % 10 > 0 ? ' ' + ones[lastPart % 10] : ''))
            } else {
              result += ' ' + ones[Math.floor(lastPart / 100)] + ' trăm'
              const remaining = lastPart % 100
              if (remaining > 0) {
                result +=
                  ' ' +
                  (remaining < 10
                    ? 'lẻ ' + ones[remaining]
                    : tens[Math.floor(remaining / 10)] +
                      (remaining % 10 > 0 ? ' ' + ones[remaining % 10] : ''))
              }
            }
          }
        }
        return result + ' đồng'
      }
    }

    // Fallback
    return number.toLocaleString('vi-VN') + ' đồng'
  }
}
