import { TIME_FORMATS } from '../constants/report.constants'

export class TimeFormatHelper {
  static formatTimeKey(date: Date, type: string): string {
    const [year, month, day] = date.toISOString().split('T')[0].split('-')
    const hours = date.getHours().toString().padStart(2, '0')

    switch (type) {
      case TIME_FORMATS.HOUR:
        return `${day}-${month}-${year} ${hours}:00`
      case TIME_FORMATS.MONTH:
        return `${month}-${year}`
      case TIME_FORMATS.YEAR:
        return year
      default:
        return `${day}-${month}-${year}` // day
    }
  }

  static isTimeBasedSort(type: string): boolean {
    return type === TIME_FORMATS.DAY || type === TIME_FORMATS.HOUR
  }
}

export class ArrayHelper {
  static createMapFromArray<T, K, V>(
    array: T[],
    keySelector: (item: T) => K,
    valueSelector: (item: T) => V
  ): Map<K, V> {
    return new Map(array.map(item => [keySelector(item), valueSelector(item)]))
  }

  static filterNonNull<T>(array: (T | null | undefined)[]): T[] {
    return array.filter((item): item is T => item !== null && item !== undefined)
  }
}

export class PaymentCalculator {
  static initializePaymentRecord() {
    return {
      totalRevenue: 0,
      totalCash: 0,
      totalTransfer: 0,
      totalVnpay: 0
    }
  }

  static initializePaymentBreakdown() {
    return {
      totalCash: 0,
      totalTransfer: 0,
      totalVnpay: 0
    }
  }
}
