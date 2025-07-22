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
  product?: Product | any
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
  // Nếu thuế không được kích hoạt, trả về 0
  if (!taxSetting.isActive) {
    return { totalTax: 0, totalTaxDiscount: 0 }
  }

  // Trường hợp phương pháp KHẤU TRỪ (DEDUCTION)
  if (taxSetting.taxMethod === TaxMethod.DEDUCTION) {
    let totalTax = 0
    let totalPriceBeforeDiscount = 0

    // Tính tổng giá trị đơn hàng trước giảm giá
    for (const detail of orderDetails) {
      const price = detail.product?.price || 0
      const amount = detail.amount

      totalPriceBeforeDiscount += price * amount
    }

    for (const detail of orderDetails) {
      const vatRate = detail.product?.vatGroup?.vatRate || 0
      const hasVat = detail.product?.hasVat
      const price = detail.product?.price || 0
      const amount = detail.amount

      const lineTotal = price * amount

      // Tính tỷ lệ của từng dòng trong tổng đơn hàng
      const ratio = totalPriceBeforeDiscount ? lineTotal / totalPriceBeforeDiscount : 0

      // Phân bổ phần tiền sau giảm giá
      const discountedLineTotal = orderTotalAfterDiscount * ratio

      let lineTax = 0

      if (hasVat) {
        // Nếu giá đã bao gồm VAT → tách VAT ra
        lineTax = discountedLineTotal - discountedLineTotal / (1 + vatRate / 100)
      } else {
        // Nếu giá chưa bao gồm VAT → tính VAT bình thường
        lineTax = discountedLineTotal * (vatRate / 100)
      }

      totalTax += lineTax
    }

    return {
      totalTax: Math.round(totalTax),
      totalTaxDiscount: 0
    }
  }

  // Trường hợp phương pháp TRỰC TIẾP (DIRECT)
  if (taxSetting.taxMethod === TaxMethod.DIRECT) {
    // Giảm trực tiếp 2% của tỷ lệ thuế vào đơn hàng
    const taxDiscount = orderTotalAfterDiscount * (taxSetting.taxDirectRate / 100) * 0.2

    return {
      totalTax: 0,
      totalTaxDiscount: Math.round(taxDiscount)
    }
  }

  return { totalTax: 0, totalTaxDiscount: 0 }
}
