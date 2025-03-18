import { DiscountType } from '@prisma/client'
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import { AnyObject } from 'interfaces/common.interface'

export function IsVietnamesePhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: AnyObject, propertyName: string) {
    registerDecorator({
      name: 'isVietnamesePhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: AnyObject) {
          const regex = /^0\d{9,10}$/
          return typeof value === 'string' && regex.test(value)
        },
        defaultMessage() {
          return `Invalid phone number!`
        }
      }
    })
  }
}

@ValidatorConstraint({ name: 'discountConstraint', async: false })
export class DiscountConstraint implements ValidatorConstraintInterface {
  validate(discount: number, args: ValidationArguments) {
    const relatedValues: AnyObject = args.object

    if (relatedValues.discountType === DiscountType.PERCENT && discount > 100) {
      return false
    }

    return true
  }

  defaultMessage() {
    return 'Value `discount` must be less than or equal to 100!'
  }
}
