import { CustomerType, Product, ProductOption } from '@prisma/client'

export interface TokenPayload {
  accountId?: string
  shopId?: string
  userId?: string
  branchId?: string
}

export interface TokenCustomerPayload {
  customerId: string
}

export interface PaginationResult {
  totalRecords: number
  totalPages: number
  currentPage: number
}

export interface AnyObject {
  [key: string]: any
}

export interface DeleteManyResponse {
  count: number
  ids: string[]
  notValidIds?: string[]
}

export interface IOrderDetail {
  id: string
  branchId: string
  orderId: string
  amount: number
  note: string
  status: number
  productOptions?: ProductOption[] | null
  product?: Product | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  tableId: string
  createdBy: string
  updatedBy: string
}

export interface ICustomer {
  id: string
  name: string
  customerTypeId?: string | null
  email?: string | null
  phone: string
  isOrganize: boolean
  address?: string | null
  description?: string | null
  representativeName?: string | null
  representativePhone?: string | null
  birthday?: Date | null
  endow?: number | null
  discount?: number | null
  discountType?: number | null
  sex?: number | null
  fax?: string | null
  tax?: string | null
  isPublic?: boolean | null
  createdAt: Date
  updatedAt: Date
  shopId: string
  createdBy?: string | null
  updatedBy?: string | null
  customerType?: CustomerType | null
}

export interface RequestJWT extends Request {
  accountId: string
  shopId: string
  branchId: string
  role: AnyObject
}
