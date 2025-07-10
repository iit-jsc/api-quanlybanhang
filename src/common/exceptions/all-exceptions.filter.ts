import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    const errorData = this.getErrorResponse(exception)

    // Log error for debugging
    this.logger.error(
      `${errorData.status} - ${errorData.message} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception
    )

    response.status(errorData.status).json({
      statusCode: errorData.status,
      message: errorData.message,
      errors: errorData.errors
    })
  }
  private getErrorResponse(exception: unknown) {
    // HttpException từ NestJS
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse()
      return {
        status: exception.getStatus(),
        message:
          typeof exceptionResponse === 'object' && exceptionResponse !== null
            ? (exceptionResponse as any).message || exception.message
            : exception.message,
        errors:
          typeof exceptionResponse === 'object' && exceptionResponse !== null
            ? (exceptionResponse as any).errors || {}
            : {}
      }
    }

    // Các lỗi JavaScript built-in
    const errorTypes = {
      TypeError: 'Kiểu dữ liệu không hợp lệ',
      SyntaxError: 'Dữ liệu không đúng định dạng',
      RangeError: 'Giá trị nằm ngoài phạm vi cho phép'
    }

    for (const [errorType, message] of Object.entries(errorTypes)) {
      if (exception instanceof (global as any)[errorType]) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Có lỗi xảy ra',
          errors: { cause: message }
        }
      }
    }

    // Lỗi đặc biệt từ message
    if (exception instanceof Error) {
      const specialErrors = {
        'Cast to ObjectId failed': 'ID không hợp lệ',
        ValidationError: 'Dữ liệu không hợp lệ'
      }

      for (const [pattern, message] of Object.entries(specialErrors)) {
        if (exception.message.includes(pattern)) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Có lỗi xảy ra',
            errors: { cause: message }
          }
        }
      }

      // Lỗi Error khác
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Có lỗi xảy ra',
        errors: { cause: 'Đã xảy ra lỗi trong quá trình xử lý' }
      }
    }

    // Lỗi không xác định
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Có lỗi xảy ra',
      errors: { cause: 'Lỗi không xác định' }
    }
  }
}
