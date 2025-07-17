import { TaxMethod, TaxApplyMode } from '@prisma/client'

interface TaxSetting {
  branchId: string
  isActive: boolean
  taxMethod: TaxMethod
  taxApplyMode: TaxApplyMode
  taxDirectRate: number
}

interface Product {
  id: string
  branchId: string
  name: string
  price: number
  vatGroupId?: string
  hasVat?: boolean
  vatGroup?: VATGroup
}

interface VATGroup {
  id: string
  name: string
  vatRate: number
  branchId?: string
}

interface OrderDetail {
  id: string
  branchId: string
  amount: number
  product?: Product
  productOriginId?: string
}

/**
 * Tính toán thuế VAT cho danh sách OrderDetail dựa trên cài đặt thuế
 * @param taxSetting - Cài đặt thuế của chi nhánh
 * @param orderDetails - Danh sách chi tiết đơn hàng
 * @returns Kết quả tính thuế bao gồm tổng thuế và chi tiết từng item
 */
export function calculateTax(
  taxSetting: TaxSetting,
  orderDetails: OrderDetail[],
  orderTotalAfterDiscount: number
): { totalTax: number; totalTaxDiscount: number } {
  // Nếu cài đặt thuế không active, trả về 0
  if (taxSetting.taxMethod === TaxMethod.DIRECT) {
    if (!taxSetting.isActive) {
      return { totalTax: 0, totalTaxDiscount: 0 }
    }

    let totalTax = 0

    for (const orderDetail of orderDetails) {
      const amount = orderDetail.amount
      const product = orderDetail.product
      const vatRate = product?.vatGroup?.vatRate || 0

      // Nếu sản phẩm đã bao gồm VAT
      if (product && product.hasVat) {
        totalTax += amount * (product.price - product.price / (1 + vatRate / 100))
      } else {
        // Nếu sản phẩm không có VAT
        totalTax += amount * (product.price * (vatRate / 100))
      }
    }

    return {
      totalTax: Number(totalTax.toFixed(0)),
      totalTaxDiscount: 0
    }
  }

  if (taxSetting.taxMethod === TaxMethod.DEDUCTION) {
    // Tính thuế theo phương pháp khấu trừ = Tổng tiền sau giảm giá * tỷ lệ thuế trực tiếp * 0.02
    console.log(orderTotalAfterDiscount, taxSetting.taxDirectRate)

    return {
      totalTax: 0,
      totalTaxDiscount: Number(
        Math.round(orderTotalAfterDiscount * (taxSetting.taxDirectRate / 100) * 0.2)
      )
    }
  }
}
