import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ExportInvoicesDto, CreateInvoiceDto } from './dto/invoice.dto'
import { VNPTElectronicInvoiceProvider } from './providers'
import { InvoiceProviderType, InvoiceStatus } from '@prisma/client'

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

    const invoiceProvider = await this.prisma.invoiceProvider.findFirst({
      where: { branchId, isActive: true },
      select: { providerType: true }
    })

    if (!invoiceProvider) {
      throw new HttpException(
        'Chưa có cấu hình nhà cung cấp hóa đơn điện tử',
        HttpStatus.BAD_REQUEST
      )
    }

    for (const invoiceData of data.invoices) {
      try {
        // 1. Validate dữ liệu đầu vào
        this.validateInvoiceData(invoiceData)

        // 2. Tạo invoice và invoice details trong database
        const invoice = await this.createInvoiceRecord(invoiceData, accountId, branchId)

        // 3. Get order code
        const order = await this.prisma.order.findUnique({
          where: { id: invoiceData.orderId },
          select: { code: true }
        })

        const orderCode = order?.code

        // 4. Handle electronic vs non-electronic export
        if (data.exportElectronic) {
          // Check active invoice provider - fail fast if not found

          if (invoiceProvider.providerType !== InvoiceProviderType.VNPT) {
            throw new HttpException('Chỉ hỗ trợ nhà cung cấp VNPT', HttpStatus.BAD_REQUEST)
          }

          // Export through VNPT
          const vnptResult = await this.exportToVNPT(invoice, invoiceData)

          // Update invoice status
          await this.updateInvoiceStatus(
            invoice.id,
            vnptResult.success ? InvoiceStatus.SUCCESS : InvoiceStatus.ERROR,
            accountId
          )

          results.push({
            success: vnptResult.success,
            orderId: invoiceData.orderId,
            orderCode: orderCode,
            message: vnptResult.success ? 'Xuất hóa đơn thành công' : vnptResult.error,
            ...(vnptResult.success && {
              exportData: {
                invoiceNumber: vnptResult.invoiceId,
                fkey: vnptResult.fkey,
                providerType: 'VNPT'
              }
            })
          })
        } else {
          // Non-electronic export
          results.push({
            success: true,
            orderId: invoiceData.orderId,
            orderCode: orderCode,
            message: 'Tạo hóa đơn thành công'
          })
        }
      } catch (error) {
        // Get order code for error case
        const order = await this.prisma.order.findUnique({
          where: { id: invoiceData.orderId },
          select: { code: true }
        })

        results.push({
          success: false,
          orderId: invoiceData.orderId,
          orderCode: order?.code,
          message: error.message
        })
      }
    }

    return {
      results,
      summary: {
        total: data.invoices.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }
  }

  /**
   * Validate dữ liệu hóa đơn
   */
  private validateInvoiceData(invoiceData: CreateInvoiceDto): void {
    const calculatedTotal = invoiceData.invoiceDetails.reduce(
      (sum, detail) => sum + detail.unitPrice * detail.amount,
      0
    )

    const calculatedTax = invoiceData.invoiceDetails.reduce(
      (sum, detail) => sum + (detail.vatAmount || 0),
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
    invoiceData.invoiceDetails.forEach((detail, index) => {
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
   */
  private async createInvoiceRecord(
    invoiceData: CreateInvoiceDto,
    accountId: string,
    branchId: string
  ) {
    // Kiểm tra hóa đơn đã tồn tại
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { orderId: invoiceData.orderId, branchId }
    })

    if (existingInvoice?.status === InvoiceStatus.SUCCESS) {
      throw new HttpException('Hóa đơn đã được xuất thành công', HttpStatus.CONFLICT)
    }

    // Xóa hóa đơn cũ nếu có (PENDING hoặc ERROR)
    if (existingInvoice) {
      await this.prisma.invoice.delete({ where: { id: existingInvoice.id } })
    }

    // Tạo hóa đơn mới
    return this.prisma.$transaction(async tx => {
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
      where: { branchId: invoice.branchId, providerType: 'VNPT', isActive: true },
      include: { invConfig: true }
    })

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

    const invoiceForVNPT = {
      ...invoice,
      invoiceDetails: invoiceData.invoiceDetails.map(detail => ({
        id: `temp-${Date.now()}-${Math.random()}`,
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
        code: `ORD-${invoiceData.orderId.slice(0, 8)}`,
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
      data: { status, updatedBy: accountId }
    })
  }
}
