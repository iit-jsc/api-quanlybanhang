/**
 * Chuyển đổi số thành chữ tiếng Việt
 * Sử dụng thư viện vn-num2words để đảm bảo độ chính xác
 */

import * as vnNum2Words from 'vn-num2words'

/**
 * Chuyển đổi số nguyên thành chữ tiếng Việt
 */
export function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'không'
  if (num < 0) return 'âm ' + numberToVietnameseWords(-num)

  // Sử dụng thư viện vn-num2words
  return vnNum2Words(num)
}

/**
 * Chuyển đổi số tiền thành chữ tiếng Việt (có đơn vị đồng)
 */
export function moneyToVietnameseWords(amount: number): string {
  if (amount === 0) return 'Không đồng'

  // Làm tròn đến số nguyên (loại bỏ phần thập phân)
  const roundedAmount = Math.round(amount)

  const words = numberToVietnameseWords(roundedAmount)

  // Viết hoa chữ cái đầu
  const capitalizedWords = words.charAt(0).toUpperCase() + words.slice(1)

  return capitalizedWords + ' đồng'
}

/**
 * Chuyển đổi số thập phân thành chữ tiếng Việt với 2 chữ số thập phân
 */
export function decimalToVietnameseWords(num: number, decimalPlaces: number = 2): string {
  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * Math.pow(10, decimalPlaces))

  let result = numberToVietnameseWords(integerPart)

  if (decimalPart > 0) {
    result += ' phẩy ' + numberToVietnameseWords(decimalPart)
  }

  return result
}
