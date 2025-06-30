import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'

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

      return fieldMessages[fieldName] || `Dữ liệu tham chiếu không hợp lệ: ${fieldName}`
    }

    return 'Dữ liệu tham chiếu không hợp lệ'
  }
}
