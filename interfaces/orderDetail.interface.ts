import { IProduct } from './product.interface'
import { IProductOption } from './productOption.interface'

export type IOrderDetail = {
  id: string
  branchId: string
  amount: number
  orderId?: string | null
  note?: string | null
  productId?: string
  product?: IProduct
  createdAt: Date
  updatedAt: Date
  productOriginId: string
  tableId: string | null
  productOptions?: IProductOption[]
  productOrigin?: IProduct
}
