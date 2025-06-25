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
      pattern: this.configService.get('EINVOICE_PATTERN') || '1/007',
      serial: this.configService.get('EINVOICE_SERIAL') || 'K25TNS',
      serialCert:
        this.configService.get('EINVOICE_SERIAL_CERT') || '540101014D8A1505AC9C7DC132A98455'
    }
  }
}
