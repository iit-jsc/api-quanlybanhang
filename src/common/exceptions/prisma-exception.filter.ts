import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.BAD_REQUEST
    let message = 'Có lỗi xảy ra!'

    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        status = HttpStatus.CONFLICT
        message = 'Dữ liệu đã tồn tại'
        break

      case 'P2003': // Foreign key constraint violation
        status = HttpStatus.NOT_FOUND
        message = this.getForeignKeyErrorMessage(exception)
        break

      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND
        message = 'Không tìm thấy dữ liệu'
        break

      case 'P2014': // Invalid ID
        status = HttpStatus.BAD_REQUEST
        message = 'ID không hợp lệ'
        break

      default:
        // Fallback to default behavior for unknown errors
        super.catch(exception, host)
        return
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: process.env.NODE_ENV === 'development' ? exception.message : undefined
    })
  }

  private getForeignKeyErrorMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    const meta = exception.meta as any
    if (meta?.field_name) {
      const fieldName = meta.field_name

      // Map field names to user-friendly messages
      const fieldMessages: Record<string, string> = {
        // Product related
        productTypeId: 'Loại sản phẩm không tồn tại',
        unitId: 'Đơn vị tính không tồn tại',
        productId: 'Sản phẩm không tồn tại',
        productOriginId: 'Sản phẩm gốc không tồn tại',
        productOptionGroupId: 'Nhóm tùy chọn sản phẩm không tồn tại',

  // Branch & Shop related
  branchId: 'Chi nhánh không tồn tại',
  shopId: 'Cửa hàng không tồn tại',

  // Customer related
  customerId: 'Khách hàng không tồn tại',
  customerTypeId: 'Loại khách hàng không tồn tại',

  // Employee related
  employeeId: 'Nhân viên không tồn tại',
  employeeGroupId: 'Nhóm nhân viên không tồn tại',

  // Order related
  orderId: 'Đơn hàng không tồn tại',
  orderDetailId: 'Chi tiết đơn hàng không tồn tại',

  // Payment related
  paymentMethodId: 'Phương thức thanh toán không tồn tại',

  // Voucher related
  voucherId: 'Voucher không tồn tại',
  voucherConditionGroupId: 'Nhóm điều kiện voucher không tồn tại',

  // Discount related
  discountIssueId: 'Đợt phát hành giảm giá không tồn tại',

  // Area & Table related
  areaId: 'Khu vực không tồn tại',
  tableId: 'Bàn không tồn tại',

  // Supplier related
  supplierTypeId: 'Loại nhà cung cấp không tồn tại',

  // Account & Role related
  userId: 'Người dùng không tồn tại',
  accountId: 'Tài khoản không tồn tại',
  roleId: 'Vai trò không tồn tại',

  // Permission related
  groupCode: 'Nhóm quyền không tồn tại',

  // Business related
  businessTypeCode: 'Loại hình kinh doanh không tồn tại',

  // Creator/Updater fields
  createdBy: 'Người tạo không tồn tại',
  updatedBy: 'Người cập nhật không tồn tại'
}

const UNIQUE_FIELD_MESSAGES: Record<string, string> = {
  // Customer fields
  phone: 'Số điện thoại đã được sử dụng',
  email: 'Email đã được sử dụng',
  code: 'Mã đã tồn tại',

  // Product fields
  name: 'Tên đã tồn tại',
  sku: 'Mã SKU đã tồn tại',
  barcode: 'Mã vạch đã tồn tại',

  // Account fields
  username: 'Tên đăng nhập đã tồn tại',

  // Branch fields
  address: 'Địa chỉ đã tồn tại',

  // Table fields
  tableNumber: 'Số bàn đã tồn tại',

  // Area fields
  areaName: 'Tên khu vực đã tồn tại',

  // Voucher fields
  voucherCode: 'Mã voucher đã tồn tại',

  // Discount fields
  discountCode: 'Mã giảm giá đã tồn tại',

  // Payment method fields
  merchantCode: 'Mã merchant đã tồn tại',
  terminalId: 'Mã terminal đã tồn tại'
}

const COMPOUND_UNIQUE_MESSAGES: Record<string, string> = {
  // Actual unique constraints from schema.prisma
  branchId_code: 'Mã đã tồn tại trong chi nhánh này',
  branchId_slug: 'Slug đã tồn tại trong chi nhánh này',
  shopId_code: 'Mã đã tồn tại trong cửa hàng này',
  shopId_phone: 'Số điện thoại đã tồn tại trong cửa hàng này',
  shopId_email: 'Email đã tồn tại trong cửa hàng này',
  branchId_email: 'Email đã tồn tại trong chi nhánh này',
  branchId_phone: 'Số điện thoại đã tồn tại trong chi nhánh này',
  type_branchId: 'Loại này đã tồn tại trong chi nhánh'
}

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientUnknownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name)

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Safety check
    if (!response || response.headersSent) {
      this.logger.error('Response already sent or unavailable', exception.message)
      return
    }

    const { status, message } = this.getErrorResponse(exception)

    try {
      response.status(status).json({
        statusCode: status,
        message,
        error: process.env.NODE_ENV === 'development' ? exception.message : undefined
      })
    } catch (responseError) {
      this.logger.error('Error sending response', responseError)
    }
  }
  private getErrorResponse(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError
  ): { status: HttpStatus; message: string } {
    // Handle unknown errors (deadlocks, etc.)
    if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
      return this.handlePrismaUnknownError(exception)
    }

    // Handle known Prisma errors
    switch (exception.code) {
      case 'P2002':
        return { status: HttpStatus.CONFLICT, message: this.getUniqueConstraintMessage(exception) }

      case 'P2003':
        return { status: HttpStatus.NOT_FOUND, message: this.getForeignKeyMessage(exception) }

      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, message: 'Không tìm thấy dữ liệu' }

      case 'P2014':
        return { status: HttpStatus.BAD_REQUEST, message: 'ID không hợp lệ' }

      case 'P2034':
        return { status: HttpStatus.CONFLICT, message: 'Xung đột dữ liệu, vui lòng thử lại' }

      default:
        this.logger.error(`Unhandled Prisma error code: ${exception.code}`, exception.message)
        return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Lỗi cơ sở dữ liệu' }
    }
  }

  private handlePrismaUnknownError(exception: Prisma.PrismaClientUnknownRequestError) {
    const errorMessage = exception.message.toLowerCase()

    if (errorMessage.includes('deadlock') || errorMessage.includes('write conflict')) {
      return { status: HttpStatus.CONFLICT, message: 'Xung đột dữ liệu, vui lòng thử lại' }
    }

    this.logger.error('Unknown Prisma error', exception.message)
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Lỗi cơ sở dữ liệu không xác định' }
  }

  private getForeignKeyMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    const meta = exception.meta as any
    const fieldName = meta?.field_name

    if (fieldName && FOREIGN_KEY_MESSAGES[fieldName]) {
      return FOREIGN_KEY_MESSAGES[fieldName]
    }

    return fieldName
      ? `Dữ liệu tham chiếu không hợp lệ: ${fieldName}`
      : 'Dữ liệu tham chiếu không hợp lệ'
  }
  private getUniqueConstraintMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    const meta = exception.meta as any
    const targets = meta?.target

    if (!targets) {
      return 'Dữ liệu đã tồn tại'
    }

    const targetArray = Array.isArray(targets) ? targets : [targets]

    // Handle compound constraints
    if (targetArray.length > 1) {
      const fieldCombination = targetArray.sort().join('_')
      return COMPOUND_UNIQUE_MESSAGES[fieldCombination] || `${fieldCombination} đã tồn tại`
    }

    // Handle single field constraints
    const singleField = targetArray[0]
    return UNIQUE_FIELD_MESSAGES[singleField] || `${singleField} đã tồn tại`
  }
}
