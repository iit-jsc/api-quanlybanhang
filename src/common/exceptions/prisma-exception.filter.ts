import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const { status, message } = this.getErrorResponse(exception)

    response.status(status).json({
      statusCode: status,
      message,
      errors: {
        cause: exception.message // Chỉ có cause trả thông tin lỗi từ Prisma
      }
    })
  }

  private getErrorResponse(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        return { status: HttpStatus.CONFLICT, message: 'Dữ liệu đã tồn tại' }

      case 'P2003': // Foreign key constraint violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: exception.message.includes('deleteMany()')
            ? 'Không thể xóa dữ liệu này vì đang được sử dụng'
            : 'Dữ liệu tham chiếu không hợp lệ'
        }

      case 'P2025': // Record not found
        return { status: HttpStatus.NOT_FOUND, message: 'Dữ liệu không tồn tại' }

      case 'P2014': // Invalid ID
        return { status: HttpStatus.BAD_REQUEST, message: 'ID không hợp lệ' }

      case 'P2009': // Record not found in nested write
        return { status: HttpStatus.NOT_FOUND, message: 'Dữ liệu không tồn tại' }

      case 'P2016': // Query interpretation error
        return { status: HttpStatus.BAD_REQUEST, message: 'Truy vấn không hợp lệ' }

      case 'P2017': // Records for relation not connected
        return { status: HttpStatus.BAD_REQUEST, message: 'Dữ liệu liên kết không đúng' }

      case 'P2000': // The provided value for the column is too long for the column's type
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Dữ liệu nhập vào vượt quá giới hạn cho phép'
        }

      default:
        return { status: HttpStatus.BAD_REQUEST, message: 'Có lỗi xảy ra' }
    }
  }
}
