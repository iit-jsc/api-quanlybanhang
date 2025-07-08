import { ValidationError, HttpException } from '@nestjs/common'
import { AnyObject } from 'interfaces/common.interface'
interface ErrorResponse {
  statusCode: number
  message: string
  errors?: AnyObject
  data?: AnyObject
}

export class CustomHttpException extends HttpException {
  constructor(statusCode: number, message: string, errors?: AnyObject, data?: AnyObject) {
    const response: ErrorResponse = {
      statusCode,
      message,
      errors,
      data
    }

    super(response, statusCode)
  }
}

export function errorFormatter(
  errors: ValidationError[],
  errMessage?: any,
  parentField?: string
): any {
  const message = errMessage || {}
  let errorField = ''
  let validationsList = []

  errors.forEach(error => {
    errorField = parentField ? `${parentField}.${error.property}` : error.property

    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, message, errorField)
    } else {
      validationsList = Object.values(error.constraints || {})
      message[errorField] = validationsList.length > 0 ? validationsList.pop() : 'Invalid Value!'
    }
  })

  return message
}
