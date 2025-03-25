export type IProductOption = {
  id: string
  isAppliedToAll?: boolean
  name: string
  isDefault?: boolean
  price: number
  photoURL?: string | null
  createdAt: Date
  updatedAt: Date
  productOptionGroupId?: string | null
}
