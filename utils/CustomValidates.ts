import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DISCOUNT_TYPE } from 'enums/common.enum';

export function IsVietnamesePhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isVietnamesePhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const regex = /^0\d{9,10}$/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `Số điện thoại không hợp lệ`;
        },
      },
    });
  };
}

@ValidatorConstraint({ name: 'discountConstraint', async: false })
export class DiscountConstraint implements ValidatorConstraintInterface {
  validate(discount: any, args: ValidationArguments) {
    const relatedValues = args.object as any;

    if (relatedValues.type === DISCOUNT_TYPE.PERCENT && discount > 100) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Giá trị phải nhỏ hơn hoặc bằng 100.';
  }
}
