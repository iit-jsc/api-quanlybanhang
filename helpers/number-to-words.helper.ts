/**
 * Chuyển đổi số thành chữ tiếng Việt
 * Hỗ trợ chuyển đổi số từ 0 đến 999,999,999,999 (999 tỷ)
 */

const ones = [
  '',
  'một',
  'hai',
  'ba',
  'bốn',
  'năm',
  'sáu',
  'bảy',
  'tám',
  'chín',
  'mười',
  'mười một',
  'mười hai',
  'mười ba',
  'mười bốn',
  'mười năm',
  'mười sáu',
  'mười bảy',
  'mười tám',
  'mười chín'
]

const tens = [
  '',
  '',
  'hai mươi',
  'ba mươi',
  'bốn mươi',
  'năm mươi',
  'sáu mươi',
  'bảy mươi',
  'tám mươi',
  'chín mươi'
]

const scales = ['', 'nghìn', 'triệu', 'tỷ']

/**
 * Chuyển đổi nhóm 3 chữ số thành chữ
 */
function convertHundreds(num: number): string {
  if (num === 0) return ''

  let result = ''
  const hundreds = Math.floor(num / 100)
  const remainder = num % 100

  // Xử lý hàng trăm
  if (hundreds > 0) {
    result += ones[hundreds] + ' trăm'
    if (remainder > 0) {
      result += ' '
      if (remainder < 10) {
        result += 'lẻ ' + ones[remainder]
      } else {
        result += convertTens(remainder)
      }
    }
  } else {
    result = convertTens(remainder)
  }

  return result.trim()
}

/**
 * Chuyển đổi nhóm 2 chữ số thành chữ
 */
function convertTens(num: number): string {
  if (num < 20) {
    return ones[num]
  }

  const tenDigit = Math.floor(num / 10)
  const oneDigit = num % 10

  let result = tens[tenDigit]

  if (oneDigit > 0) {
    if (oneDigit === 1 && tenDigit > 1) {
      result += ' mốt' // Đặc biệt: 21 -> hai mươi mốt, 31 -> ba mươi mốt, ...
    } else if (oneDigit === 5 && tenDigit > 1) {
      result += ' lăm' // Đặc biệt: 25 -> hai mươi lăm, 35 -> ba mươi lăm, ...
    } else {
      result += ' ' + ones[oneDigit]
    }
  }

  return result
}

/**
 * Chuyển đổi số nguyên thành chữ tiếng Việt
 */
export function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'không'
  if (num < 0) return 'âm ' + numberToVietnameseWords(-num)

  // Xử lý số quá lớn
  if (num >= 1000000000000) {
    return num.toLocaleString('vi-VN')
  }

  const groups: string[] = []
  let scaleIndex = 0

  while (num > 0 && scaleIndex < scales.length) {
    const group = num % 1000
    if (group > 0) {
      let groupText = convertHundreds(group)

      // Xử lý trường hợp đặc biệt cho nhóm nghìn
      if (scaleIndex === 1 && group < 100 && groups.length > 0) {
        if (group < 10) {
          groupText = 'lẻ ' + groupText
        } else if (group < 20) {
          groupText = 'lẻ ' + groupText
        }
      }

      if (scaleIndex > 0) {
        groupText += ' ' + scales[scaleIndex]
      }

      groups.unshift(groupText)
    }

    num = Math.floor(num / 1000)
    scaleIndex++
  }

  return groups.join(' ').trim()
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
