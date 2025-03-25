export type IProduct = {
  id: string
  branchId: string
  unitId: string
  name: string
  slug: string
  productTypeId: string
  price: number
  code?: string | null
  oldPrice?: number | null
  description?: string | null
  thumbnail?: string | null
  photoURLs?: string[]
  createdAt: Date
  updatedAt: Date
}
