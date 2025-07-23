import {
  InvoiceProvider,
  InvoiceConfig,
  Invoice,
  InvoiceDetail,
  InvoiceStatus,
  TaxMethod,
  TaxApplyMode,
  Prisma
} from '@prisma/client'

// Re-export types from Prisma for easier access
export type {
  InvoiceProvider,
  InvoiceConfig,
  Invoice,
  InvoiceDetail,
  InvoiceStatus,
  TaxMethod,
  TaxApplyMode
}

// Provider and configuration types
export type InvoiceProviderWithConfig = InvoiceProvider & {
  invConfig?: InvoiceConfig | null
}

export type BranchWithInvoiceConfig = {
  id: string
  name: string
  taxSetting?: {
    branchId: string
    isActive: boolean
    taxMethod: TaxMethod
    taxApplyMode: TaxApplyMode
    taxDirectRate: number
    updatedBy: string
    updatedAt: Date
  } | null
  invoiceProviders?: InvoiceProviderWithConfig[]
}

// Order types
export type OrderWithInvoiceData = {
  id: string
  branchId: string
  code: string
  orderTotal: number
  totalTax?: number | null
  totalTaxDiscount?: number | null
  isTaxApplied?: boolean | null
  customer?: {
    name?: string | null
    tax?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
  } | null
  orderDetails: OrderDetailWithProduct[]
  branch?: BranchWithInvoiceConfig | null
  invoice?: {
    id: string
    status: InvoiceStatus
    invoiceDetails: Array<{
      id: string
      productName: string
      productCode?: string | null
      unit?: string | null
      unitPrice: number
      amount: number
      vatRate: number
      vatAmount: number
    }>
  } | null
  paymentMethod?: {
    id: string
    branchId: string
    bankName: string
    bankCode: string
    representative: string
    photoURL: string
    type: unknown
    active: boolean
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
  } | null
  [key: string]: unknown
}

export type OrderDetailWithProduct = {
  id: string
  amount: number
  product: Prisma.JsonValue
  orderId: string
  [key: string]: unknown
}

// Tax and configuration types
export type TaxSetting = {
  branchId: string
  isActive: boolean
  taxMethod: TaxMethod
  taxApplyMode: TaxApplyMode
  taxDirectRate: number
  updatedBy: string
  updatedAt: Date
}

export interface ValidatedConfiguration {
  invoiceProvider: InvoiceProviderWithConfig
  taxSetting: TaxSetting
}

// VNPT response types
export interface VNPTResponse {
  success: boolean
  fkey?: string
  invoiceId?: string
  error?: string
}

// Product information types
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

// VNPT Invoice interface
export interface VNPTInvoiceWithRelations extends Invoice {
  order?: {
    id: string
    code: string
    orderTotal: number
    customer?: {
      name?: string | null
      tax?: string | null
      address?: string | null
      phone?: string | null
      email?: string | null
    } | null
    paymentMethod?: {
      id: string
      branchId: string
      bankName: string
      bankCode: string
      representative: string
      photoURL: string
      type: unknown
      active: boolean
      createdAt: Date
      updatedAt: Date
      createdBy: string
      updatedBy: string
    } | null
  } | null
  invoiceDetails?: Array<
    InvoiceDetail & {
      orderDetail?: {
        id: string
        amount: number
        product: Prisma.JsonValue
      } | null
    }
  >
}

// Batch export types
export interface BatchExportRequest {
  orderIds: string[]
  isExported?: boolean
  accountId: string
  branchId: string
}

export interface BatchExportResult {
  orderId: string
  success: boolean
  message: string
  invoice?: any
  error?: string
}

export interface BatchExportResponse {
  message: string
  success: boolean
  results: BatchExportResult[]
  summary: {
    total: number
    successful: number
    failed: number
  }
}
