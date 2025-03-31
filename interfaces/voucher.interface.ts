import {
  ConditionOperator,
  DiscountType,
  VoucherConditionType,
  VoucherProductType,
  VoucherType
} from '@prisma/client'
import { IProduct } from './product.interface'

export interface IVoucher {
  id: string
  branchId: string
  name: string
  startDate: Date
  amount: number
  type: VoucherType
  code: string
  endDate?: Date
  amountApplied: number
  maxValue?: number
  isActive: boolean
  description?: string
  discount: number
  discountType: DiscountType
  createdAt: Date
  updatedAt: Date
  operator: ConditionOperator
  conditionGroups: IVoucherConditionGroup[]
  voucherProducts: IVoucherProduct[]
}

export interface IVoucherConditionGroup {
  id: string
  operator: ConditionOperator
  conditions?: IVoucherCondition[]
}

export interface IVoucherCondition {
  id: string
  voucherConditionGroupId: string
  product: IProduct
  type: VoucherConditionType
  minQuantity?: number
  minCustomer?: number
  minOrderTotal?: number
  createdAt: Date
  updatedAt: Date
  voucherConditionGroup?: IVoucherConditionGroup
}

export interface IVoucherProduct {
  id: string
  voucherId: string
  limitQuantity?: number
  promotionalPrice?: number
  type: VoucherProductType
  amount: number
  name?: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
  product?: IProduct
}

export interface IVoucherCheckRequest {
  orderTotal?: number
  totalPeople?: number
}
