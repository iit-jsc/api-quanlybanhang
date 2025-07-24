import { Injectable } from '@nestjs/common'
import { BaseElectronicInvoiceProvider } from './base-electronic-invoice.provider'
import { InvoiceProvider } from '../types/invoice.types'

@Injectable()
export class ElectronicInvoiceProviderRegistry {
  private readonly providers = new Map<string, BaseElectronicInvoiceProvider>()

  /**
   * Đăng ký provider mới
   * @param type Loại provider
   * @param provider Instance của provider
   */
  registerProvider(type: string, provider: BaseElectronicInvoiceProvider): void {
    this.providers.set(type.toUpperCase(), provider)
  }

  /**
   * Lấy provider theo loại
   * @param invoiceProvider Thông tin provider từ database
   * @returns Instance của provider
   */
  getProvider(invoiceProvider: InvoiceProvider): BaseElectronicInvoiceProvider {
    const providerType = invoiceProvider.providerType?.toUpperCase()

    if (!providerType) {
      throw new Error('Provider type is not specified')
    }

    const provider = this.providers.get(providerType)
    if (!provider) {
      throw new Error(`Electronic invoice provider '${providerType}' is not supported`)
    }

    return provider
  }

  /**
   * Kiểm tra provider có được hỗ trợ không
   * @param providerType Loại provider
   * @returns true nếu được hỗ trợ
   */
  isProviderSupported(providerType: string): boolean {
    return this.providers.has(providerType.toUpperCase())
  }

  /**
   * Lấy danh sách tất cả providers được hỗ trợ
   * @returns Danh sách loại providers
   */
  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}
