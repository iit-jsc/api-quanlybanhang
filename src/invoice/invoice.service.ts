import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ExportInvoicesDto, CreateInvoiceDetailDto, CreateInvoiceDto } from './dto/invoice.dto'
import { VNPTElectronicInvoiceProvider } from './providers'
import { InvoiceStatus } from '@prisma/client'

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vnptProvider: VNPTElectronicInvoiceProvider
  ) {}
  /**
   * Xuất nhiều hóa đơn điện tử
   */
  async exportInvoices(data: ExportInvoicesDto, accountId: string, branchId: string) {
    const results = []

    for (const invoiceData of data.invoices) {
      try {
        // 1. Validate dữ liệu đầu vào
        this.validateInvoiceData(invoiceData)

        // 2. Tạo invoice và invoice details trong database
        const invoice = await this.createInvoiceRecord(invoiceData, accountId, branchId)

        // 3. Xuất hóa đơn điện tử qua VNPT
        if (data.exportElectronic) {
          const vnptResult = await this.exportToVNPT(invoice, invoiceData)

          // 5. Cập nhật trạng thái
          await this.updateInvoiceStatus(
            invoice.id,
            vnptResult.success ? InvoiceStatus.SUCCESS : InvoiceStatus.ERROR,
            accountId
          )

          results.push({
            invoiceId: invoice.id,
            success: vnptResult.success,
            message: vnptResult.success ? 'Xuất hóa đơn thành công' : vnptResult.error,
            vnptData: vnptResult
          })
        } else {
          results.push({
            invoiceId: invoice.id,
            success: true,
            message: 'Tạo hóa đơn thành công'
          })
        }
      } catch (error) {
        results.push({
          success: false,
          message: error.message,
          error: error
        })
      }
    }

    return {
      message: 'Xử lý hoàn thành',
      results,
      summary: {
        total: data.invoices.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }
  }

  /**
   * Lấy danh sách hóa đơn theo chi nhánh
   */
  async getInvoicesByBranch(branchId: string) {
    return this.prisma.invoice.findMany({
      where: { branchId },
      include: {
        order: {
          include: {
            customer: true
          }
        },
        invoiceDetails: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Lấy thông tin chi tiết hóa đơn
   */
  async getInvoiceById(id: string, branchId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, branchId },
      include: {
        order: {
          include: {
            customer: true,
            paymentMethod: true
          }
        },
        invoiceDetails: true
      }
    })

    if (!invoice) {
      throw new HttpException('Không tìm thấy hóa đơn', HttpStatus.NOT_FOUND)
    }
    return invoice
  }
  /**
   * Validate dữ liệu hóa đơn
   */
  private validateInvoiceData(invoiceData: CreateInvoiceDto): void {
    // Validate tiền hàng, thuế, giảm giá
    const calculatedTotal = invoiceData.invoiceDetails.reduce(
      (sum: number, detail: CreateInvoiceDetailDto) => {
        return sum + detail.unitPrice * detail.amount
      },
      0
    )

    const calculatedTax = invoiceData.invoiceDetails.reduce(
      (sum: number, detail: CreateInvoiceDetailDto) => {
        return sum + (detail.vatAmount || 0)
      },
      0
    )

    // Validate tổng tiền hàng
    if (Math.abs(calculatedTotal - invoiceData.totalBeforeTax) > 0.01) {
      throw new HttpException(
        `Tổng tiền hàng không chính xác. Tính toán: ${calculatedTotal}, Nhận được: ${invoiceData.totalBeforeTax}`,
        HttpStatus.BAD_REQUEST
      )
    }

    // Validate tổng tiền thuế
    if (Math.abs(calculatedTax - invoiceData.totalTax) > 0.01) {
      throw new HttpException(
        `Tổng tiền thuế không chính xác. Tính toán: ${calculatedTax}, Nhận được: ${invoiceData.totalTax}`,
        HttpStatus.BAD_REQUEST
      )
    }

    // Validate tổng tiền sau thuế
    const expectedAfterTax = calculatedTotal + calculatedTax - (invoiceData.totalTaxDiscount || 0)
    if (Math.abs(expectedAfterTax - invoiceData.totalAfterTax) > 0.01) {
      throw new HttpException(
        `Tổng tiền sau thuế không chính xác. Tính toán: ${expectedAfterTax}, Nhận được: ${invoiceData.totalAfterTax}`,
        HttpStatus.BAD_REQUEST
      )
    }

    // Validate từng chi tiết hóa đơn
    invoiceData.invoiceDetails.forEach((detail: CreateInvoiceDetailDto, index: number) => {
      if (detail.amount <= 0) {
        throw new HttpException(
          `Chi tiết ${index + 1}: Số lượng phải lớn hơn 0`,
          HttpStatus.BAD_REQUEST
        )
      }

      if (detail.unitPrice <= 0) {
        throw new HttpException(
          `Chi tiết ${index + 1}: Đơn giá phải lớn hơn 0`,
          HttpStatus.BAD_REQUEST
        )
      }

      // Validate VAT nếu có
      if (detail.vatRate && detail.vatAmount) {
        const expectedVat = (detail.unitPrice * detail.amount * detail.vatRate) / 100
        if (Math.abs(expectedVat - detail.vatAmount) > 0.01) {
          throw new HttpException(
            `Chi tiết ${index + 1}: VAT không chính xác. Tính toán: ${expectedVat}, Nhận được: ${detail.vatAmount}`,
            HttpStatus.BAD_REQUEST
          )
        }
      }
    })
  }
  /**
   * Tạo bản ghi hóa đơn và chi tiết hóa đơn
   * - Nếu hóa đơn đã tạo với status SUCCESS thì không tạo lại
   * - Nếu status PENDING hoặc ERROR thì xóa cũ và tạo mới
   */
  private async createInvoiceRecord(
    invoiceData: CreateInvoiceDto,
    accountId: string,
    branchId: string
  ) {
    // Kiểm tra hóa đơn đã tồn tại cho orderId này
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: {
        orderId: invoiceData.orderId,
        branchId
      }
    })

    if (existingInvoice) {
      // Nếu đã thành công thì không tạo lại
      if (existingInvoice.status === InvoiceStatus.SUCCESS) {
        throw new HttpException(
          `Hóa đơn cho đơn hàng ${invoiceData.orderId} đã được xuất thành công`,
          HttpStatus.CONFLICT
        )
      }

      // Nếu PENDING hoặc ERROR thì xóa hóa đơn cũ và chi tiết
      if (
        existingInvoice.status === InvoiceStatus.PENDING ||
        existingInvoice.status === InvoiceStatus.ERROR
      ) {
        // Xóa hóa đơn (cascade sẽ xóa invoice details)
        await this.prisma.invoice.delete({
          where: { id: existingInvoice.id }
        })
      }
    }

    // Tạo hóa đơn mới với chi tiết trong transaction
    return this.prisma.$transaction(async tx => {
      // Tạo hóa đơn
      const invoice = await tx.invoice.create({
        data: {
          branchId,
          orderId: invoiceData.orderId,
          customerName: invoiceData.customerName,
          originalName: invoiceData.originalName,
          customerTaxCode: invoiceData.customerTaxCode,
          customerAddress: invoiceData.customerAddress,
          customerPhone: invoiceData.customerPhone,
          customerEmail: invoiceData.customerEmail,
          totalBeforeTax: invoiceData.totalBeforeTax,
          totalTax: invoiceData.totalTax,
          totalTaxDiscount: invoiceData.totalTaxDiscount || 0,
          totalAfterTax: invoiceData.totalAfterTax,
          status: InvoiceStatus.PENDING,
          createdBy: accountId
        }
      })

      // Tạo chi tiết hóa đơn
      await tx.invoiceDetail.createMany({
        data: invoiceData.invoiceDetails.map(detail => ({
          invoiceId: invoice.id,
          productName: detail.productName,
          productCode: detail.productCode,
          unit: detail.unit,
          unitPrice: detail.unitPrice,
          amount: detail.amount,
          vatRate: detail.vatRate
        }))
      })

      return invoice
    })
  }

  /**
   * Xuất hóa đơn qua VNPT
   */
  private async exportToVNPT(
    invoice: Awaited<ReturnType<typeof this.createInvoiceRecord>>,
    invoiceData: CreateInvoiceDto
  ) {
    // Lấy provider config
    const invoiceProvider = await this.prisma.invoiceProvider.findFirst({
      where: {
        branchId: invoice.branchId,
        providerType: 'VNPT',
        isActive: true
      },
      include: {
        invConfig: true
      }
    })

    if (!invoiceProvider) {
      throw new HttpException('Không tìm thấy cấu hình VNPT', HttpStatus.NOT_FOUND)
    }

    if (!invoiceProvider.invConfig) {
      throw new HttpException('Không tìm thấy cấu hình chi tiết VNPT', HttpStatus.NOT_FOUND)
    }

    console.log('🔍 [Invoice Service] VNPT Provider config loaded:', {
      providerId: invoiceProvider.id,
      hasInvConfig: !!invoiceProvider.invConfig,
      configFields: invoiceProvider.invConfig ? Object.keys(invoiceProvider.invConfig) : [],
      vnptApiUrl: invoiceProvider.invConfig?.vnptApiUrl || 'NOT_SET',
      vnptUsername: invoiceProvider.invConfig?.vnptUsername || 'NOT_SET',
      hasPassword: !!invoiceProvider.invConfig?.vnptPassword,
      hasAccountPassword: !!invoiceProvider.invConfig?.vnptAccountPassword,
      invPattern: invoiceProvider.invConfig?.invPattern || 'NOT_SET',
      invSerial: invoiceProvider.invConfig?.invSerial || 'NOT_SET'
    })

    // Transform to expected provider format with full config
    const providerData = {
      providerType: invoiceProvider.providerType,
      providerName: 'VNPT',
      isActive: invoiceProvider.isActive,
      config: {
        id: invoiceProvider.id,
        providerId: invoiceProvider.id,
        vnptApiUrl: invoiceProvider.invConfig.vnptApiUrl || '',
        vnptLookupUrl: invoiceProvider.invConfig.vnptLookupUrl || '',
        vnptUsername: invoiceProvider.invConfig.vnptUsername || '',
        vnptPassword: invoiceProvider.invConfig.vnptPassword || '',
        vnptAccount: invoiceProvider.invConfig.vnptAccount || '',
        vnptAccountPassword: invoiceProvider.invConfig.vnptAccountPassword || '',
        invPattern: invoiceProvider.invConfig.invPattern || '',
        invSerial: invoiceProvider.invConfig.invSerial || ''
      }
    }

    // Create invoice data with details for VNPT
    const invoiceForVNPT = {
      ...invoice,
      invoiceDetails: invoiceData.invoiceDetails.map(detail => ({
        id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
        invoiceId: invoice.id,
        productName: detail.productName,
        productCode: detail.productCode,
        unit: detail.unit,
        unitPrice: detail.unitPrice,
        amount: detail.amount,
        vatRate: detail.vatRate,
        vatAmount: detail.vatAmount,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      order: {
        id: invoiceData.orderId,
        code: `ORD-${invoiceData.orderId.slice(0, 8)}`, // Generate order code
        orderTotal: invoiceData.totalAfterTax,
        customer: {
          name: invoiceData.customerName,
          tax: invoiceData.customerTaxCode,
          address: invoiceData.customerAddress,
          phone: invoiceData.customerPhone,
          email: invoiceData.customerEmail
        },
        paymentMethod: null
      }
    }

    return this.vnptProvider.exportInvoice(providerData, invoiceForVNPT, invoice.totalTax || 0)
  }

  /**
   * Cập nhật trạng thái hóa đơn
   */
  private async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, accountId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        updatedBy: accountId
      }
    })
  }
}
