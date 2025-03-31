import { IProduct } from './product.interface'
import { IProductOption } from './productOption.interface'

export type IOrderDetail = {
  id: string
  branchId: string
  amount: number
  note?: string | null
  product?: IProduct | any
  createdAt: Date
  updatedAt: Date
  productOriginId: string
  tableId: string | null
  productOptions?: IProductOption[] | any
  productOrigin?: IProduct
}
