import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { Response } from 'express'

interface ErrorResponse {
  status: number
  message: string
  errors: any
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  // Error type mappings
  private readonly errorMappings = {
    // JavaScript built-in errors
    TypeError: 'Kiểu dữ liệu không hợp lệ',
    SyntaxError: 'Dữ liệu không đúng định dạng',
    RangeError: 'Giá trị nằm ngoài phạm vi cho phép',

    // Prisma & Database errors
    'Cast to ObjectId failed': 'ID không hợp lệ',
    ValidationError: 'Dữ liệu không hợp lệ',
    'Invalid value provided': 'Kiểu dữ liệu không hợp lệ',
    'Expected String': 'Kiểu dữ liệu không hợp lệ',
    'Expected Int': 'Kiểu dữ liệu không hợp lệ',
    'Expected Boolean': 'Kiểu dữ liệu không hợp lệ',
    PrismaClientValidationError: 'Kiểu dữ liệu không hợp lệ'
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    const errorData = this.getErrorResponse(exception)

    this.logger.error(
      `${errorData.status} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception
    )

    response.status(errorData.status).json({
      statusCode: errorData.status,
      message: errorData.message,
      errors: errorData.errors
    })
  }

  private getErrorResponse(exception: unknown): ErrorResponse {
    // HttpException từ NestJS
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception)
    }

    // JavaScript built-in errors
    const errorType = exception?.constructor?.name
    if (errorType && this.errorMappings[errorType]) {
      return this.createErrorResponse(this.errorMappings[errorType])
    }

    // Error messages
    if (exception instanceof Error) {
      const errorMessage = this.findErrorMessage(exception.message)
      return this.createErrorResponse(errorMessage)
    }

    // Default unknown error
    return this.createErrorResponse('Lỗi không xác định')
  }

  private handleHttpException(exception: HttpException): ErrorResponse {
    const response = exception.getResponse()
    return {
      status: exception.getStatus(),
      message: this.extractMessage(response, exception.message),
      errors: this.extractErrors(response)
    }
  }

  private findErrorMessage(message: string): string {
    for (const [pattern, errorMsg] of Object.entries(this.errorMappings)) {
      if (message.includes(pattern)) {
        return errorMsg
      }
    }
    return 'Đã xảy ra lỗi trong quá trình xử lý'
  }

  private createErrorResponse(cause: string): ErrorResponse {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Có lỗi xảy ra',
      errors: { cause }
    }
  }
  private extractMessage(response: any, fallback: string): string {
    return typeof response === 'object' && response?.message ? response.message : fallback
  }

  private extractErrors(response: any): any {
    return typeof response === 'object' && response?.errors ? response.errors : {}
  }
}
