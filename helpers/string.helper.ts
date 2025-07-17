import slugify from 'slugify'
import { AnyObject } from '../interfaces/common.interface'

export const removeDiacritics = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/d/g, 'đ')
    .replace(/D/g, 'Đ')
}

export function extractPermissions(data: AnyObject) {
  return Object.values(data)
}

export function generateCode(wordStart: string, length?: number) {
  const uuid = crypto.randomUUID()
  return (
    wordStart +
    uuid
      .replace(/-/g, '')
      .split('')
      .map(char => char.charCodeAt(0).toString())
      .join('')
      .slice(0, length || 8)
  )
}

export function generateSlug(text: string) {
  const slug = slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi'
  })

  const uuid = generateCode('')

  return `${slug}-${uuid}`
}

export function generateCompositeKey(
  tableId: string,
  productId: string,
  note?: string,
  productOptionIds?: string[]
): string {
  const sortedOptions =
    productOptionIds && productOptionIds.length > 0 ? productOptionIds.sort().join('_') : 'empty'

  const notePart = note ? note.trim() : 'empty'

  return `${tableId || 'empty'}_${productId || 'empty'}_${sortedOptions}_${notePart}`
}
