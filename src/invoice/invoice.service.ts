import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ExportInvoicesDto, CreateInvoiceDto, InvoiceType } from './dto/invoice.dto'
import { VNPTElectronicInvoiceProvider } from './providers'
import { InvoiceProviderType, InvoiceStatus, TaxMethod } from '@prisma/client'

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

    // Optimized query: Fetch all required data in one go
    const branchData = await this.prisma.branch.findUniqueOrThrow({
      where: { id: branchId },
      include: {
        taxSetting: true,
        invoiceProviders: {
          where: { isActive: true },
          include: { invConfig: true }
        }
      }
    })

    // Check if electronic export is requested but no active provider exists
    if (branchData.invoiceProviders.length === 0) {
      throw new HttpException(
        'Chưa có cấu hình nhà cung cấp hóa đơn điện tử',
        HttpStatus.BAD_REQUEST
      )
    }

    // Get all order IDs to fetch order codes in batch
    for (const invoiceData of data.invoices) {
      try {
        // 1. Determine invoice type automatically if not specified
        const finalInvoiceData = this.enrichInvoiceWithType(invoiceData, branchData.taxSetting)

        // 2. Validate invoice data based on type
        this.validateInvoiceData(finalInvoiceData, branchData.taxSetting)

        // 3. Create invoice record in database
        const invoice = await this.createInvoiceRecord(finalInvoiceData, accountId, branchId)

        // 4. Handle electronic vs non-electronic export
        const vnptResult = await this.exportToVNPT(invoice, finalInvoiceData)

        // Update invoice status
        await this.updateInvoiceStatus(
          invoice.id,
          vnptResult.success ? InvoiceStatus.SUCCESS : InvoiceStatus.ERROR,
          accountId
        )

        results.push({
          success: vnptResult.success,
          orderId: invoiceData.orderId,
          message: vnptResult.success ? 'Xuất hóa đơn thành công' : vnptResult.error,
          ...(vnptResult.success && {
            exportData: {
              invoiceNumber: vnptResult.invoiceId,
              fkey: vnptResult.fkey,
              providerType: 'VNPT',
              invoiceType: finalInvoiceData.invoiceType
            }
          })
        })
      } catch (error) {
        results.push({
          success: false,
          orderId: invoiceData.orderId,
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
   * Validate dữ liệu hóa đơn theo loại hóa đơn
   */
  private validateInvoiceData(invoiceData: CreateInvoiceDto, taxSetting?: any): void {
    const calculatedTotal = invoiceData.invoiceDetails.reduce(
      (sum, detail) => sum + detail.unitPrice * detail.amount,
      0
    )

    const calculatedTax = invoiceData.invoiceDetails.reduce(
      (sum, detail) => sum + (detail.vatAmount || 0),
      0
    )

    // Validate tổng tiền hàng trước thuế
    if (Math.abs(calculatedTotal - invoiceData.totalBeforeTax) > 0.01) {
      throw new HttpException(
        `Tổng tiền hàng không chính xác. Tính toán: ${calculatedTotal}, Nhận được: ${invoiceData.totalBeforeTax}`,
        HttpStatus.BAD_REQUEST
      )
    }

    // Validate theo loại hóa đơn (trước khi validate tổng tiền)
    if (invoiceData.invoiceType === InvoiceType.VAT_INVOICE) {
      this.validateVATInvoiceFields(invoiceData)
    } else if (invoiceData.invoiceType === InvoiceType.SALES_INVOICE) {
      this.validateSalesInvoiceFields(invoiceData)
    }

    // Validate tổng tiền thuế (nếu có)
    if (invoiceData.totalTax !== undefined && invoiceData.totalTax !== null) {
      if (Math.abs(calculatedTax - invoiceData.totalTax) > 0.01) {
        throw new HttpException(
          `Tổng tiền thuế không chính xác. Tính toán: ${calculatedTax}, Nhận được: ${invoiceData.totalTax}`,
          HttpStatus.BAD_REQUEST
        )
      }
    }

    const totalTax = invoiceData.totalTax || 0
    const totalTaxDiscount = invoiceData.totalTaxDiscount || 0

    // Validate totalTaxDiscount for DIRECT (Sales) invoices
    if (invoiceData.invoiceType === InvoiceType.SALES_INVOICE && totalTaxDiscount > 0) {
      this.validateDirectTaxDiscount(invoiceData, totalTaxDiscount, taxSetting)
    }

    // Công thức: totalAfterTax = totalBeforeTax + totalTax - totalTaxDiscount
    const expectedAfterTax = calculatedTotal + totalTax - totalTaxDiscount

    if (Math.abs(expectedAfterTax - invoiceData.totalAfterTax) > 0.01) {
      throw new HttpException(
        `Tổng tiền sau thuế không chính xác. 
         Tính toán: ${calculatedTotal} + ${totalTax} - ${totalTaxDiscount}  = ${expectedAfterTax}
         Nhận được: ${invoiceData.totalAfterTax}`,
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

      // Validate VAT theo loại hóa đơn
      if (invoiceData.invoiceType === InvoiceType.SALES_INVOICE) {
        // DIRECT invoices không được có VAT fields
        if ((detail.vatRate && detail.vatRate > 0) || (detail.vatAmount && detail.vatAmount > 0)) {
          throw new HttpException(
            `Chi tiết ${index + 1}: Hóa đơn bán hàng (DIRECT) không được có thông tin thuế VAT`,
            HttpStatus.BAD_REQUEST
          )
        }
      } else {
        // VAT invoices: validate VAT nếu có thuế suất
        if (detail.vatRate && detail.vatRate > 0) {
          // Nếu có thuế suất > 0 thì bắt buộc phải có tiền thuế
          if (!detail.vatAmount || detail.vatAmount <= 0) {
            throw new HttpException(
              `Chi tiết ${index + 1}: Khi có thuế suất ${detail.vatRate}% thì bắt buộc phải có tiền thuế VAT > 0`,
              HttpStatus.BAD_REQUEST
            )
          }

          // Validate tính toán VAT chính xác
          const expectedVat = (detail.unitPrice * detail.amount * detail.vatRate) / 100
          if (Math.abs(expectedVat - detail.vatAmount) > 0.01) {
            throw new HttpException(
              `Chi tiết ${index + 1}: VAT không chính xác. Tính toán: ${expectedVat}, Nhận được: ${detail.vatAmount}`,
              HttpStatus.BAD_REQUEST
            )
          }
        } else if (detail.vatAmount && detail.vatAmount > 0) {
          // Nếu có tiền thuế nhưng không có thuế suất thì báo lỗi
          throw new HttpException(
            `Chi tiết ${index + 1}: Có tiền thuế ${detail.vatAmount} nhưng không có thuế suất`,
            HttpStatus.BAD_REQUEST
          )
        }
      }
    })
  }

  /**
   * Validate các trường bắt buộc cho hóa đơn VAT
   */
  private validateVATInvoiceFields(invoiceData: CreateInvoiceDto): void {
    // VAT Invoice bắt buộc có mã số thuế
    if (!invoiceData.customerTaxCode) {
      throw new HttpException(
        'Hóa đơn VAT bắt buộc phải có mã số thuế khách hàng',
        HttpStatus.BAD_REQUEST
      )
    }

    // VAT Invoice bắt buộc có tổng tiền thuế
    if (invoiceData.totalTax === undefined || invoiceData.totalTax === null) {
      throw new HttpException('Hóa đơn VAT bắt buộc phải có tổng tiền thuế', HttpStatus.BAD_REQUEST)
    }

    // Kiểm tra logic: nếu có bất kỳ chi tiết nào có thuế suất > 0 thì tổng tiền thuế phải > 0
    const hasVATItems = invoiceData.invoiceDetails.some(
      detail => detail.vatRate && detail.vatRate > 0
    )
    if (hasVATItems && invoiceData.totalTax <= 0) {
      throw new HttpException(
        'Hóa đơn có sản phẩm chịu thuế VAT nhưng tổng tiền thuế = 0',
        HttpStatus.BAD_REQUEST
      )
    }

    // Validate các chi tiết hóa đơn có VAT rate và VAT amount
    invoiceData.invoiceDetails.forEach((detail, index) => {
      if (detail.vatRate === undefined || detail.vatRate === null) {
        throw new HttpException(
          `Chi tiết ${index + 1}: Hóa đơn VAT bắt buộc phải có thuế suất`,
          HttpStatus.BAD_REQUEST
        )
      }

      // Nếu thuế suất > 0 thì bắt buộc phải có tiền thuế
      if (detail.vatRate > 0) {
        if (detail.vatAmount === undefined || detail.vatAmount === null || detail.vatAmount <= 0) {
          throw new HttpException(
            `Chi tiết ${index + 1}: Hóa đơn VAT với thuế suất ${detail.vatRate}% bắt buộc phải có tiền thuế > 0`,
            HttpStatus.BAD_REQUEST
          )
        }
      }
    })
  }

  /**
   * Validate các trường bắt buộc cho hóa đơn bán hàng (DIRECT)
   */
  private validateSalesInvoiceFields(invoiceData: CreateInvoiceDto): void {
    // DIRECT Invoice không được có mã số thuế (hoặc có thể có nhưng không bắt buộc)
    // Không được có tổng tiền thuế VAT
    if (invoiceData.totalTax && invoiceData.totalTax > 0) {
      throw new HttpException(
        'Hóa đơn bán hàng (DIRECT) không được có tổng tiền thuế VAT',
        HttpStatus.BAD_REQUEST
      )
    }

    // Kiểm tra không có chi tiết nào có VAT
    const hasVATItems = invoiceData.invoiceDetails.some(
      detail => (detail.vatRate && detail.vatRate > 0) || (detail.vatAmount && detail.vatAmount > 0)
    )

    if (hasVATItems) {
      throw new HttpException(
        'Hóa đơn bán hàng (DIRECT) không được có các mặt hàng chịu thuế VAT',
        HttpStatus.BAD_REQUEST
      )
    }
  }
  /**
   * Validate công thức giảm thuế cho hóa đơn DIRECT theo Nghị quyết 204/2025/QH15
   */
  private validateDirectTaxDiscount(
    invoiceData: CreateInvoiceDto,
    totalTaxDiscount: number,
    taxSetting?: any
  ): void {
    // Công thức: totalTaxDiscount = totalBeforeTax * 20% * taxDirectRate/100
    const taxDirectRate = taxSetting?.taxDirectRate || 100 // Lấy từ TaxSetting hoặc mặc định 100%
    const expectedTaxDiscount = (invoiceData.totalBeforeTax * 20 * taxDirectRate) / (100 * 100)

    if (Math.abs(expectedTaxDiscount - totalTaxDiscount) > 0.01) {
      throw new HttpException(
        `Số tiền giảm thuế không chính xác theo Nghị quyết 204/2025/QH15. 
         Tính toán: ${invoiceData.totalBeforeTax} * 20% * ${taxDirectRate}% = ${expectedTaxDiscount}
         Nhận được: ${totalTaxDiscount}`,
        HttpStatus.BAD_REQUEST
      )
    }
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

    // Lấy thông tin order để tạo lookupKey
    const order = await this.prisma.order.findUnique({
      where: { id: invoiceData.orderId },
      select: { code: true }
    })

    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.NOT_FOUND)
    }

    // Tạo lookupKey theo format: IIT_POS_<order code>
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const lookupKey = `IIT_POS_${order.code}_${randomSuffix}`

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
          customerCardId: invoiceData.customerCardId, // Thêm trường này
          passport: invoiceData.passport, // Thêm trường này
          customerBankName: invoiceData.customerBankName, // Thêm trường này
          customerBankCode: invoiceData.customerBankCode, // Thêm trường này
          paymentMethod: invoiceData.paymentMethod,
          totalBeforeTax: invoiceData.totalBeforeTax,
          totalTax: invoiceData.totalTax,
          totalTaxDiscount: invoiceData.totalTaxDiscount || 0,
          totalAfterTax: invoiceData.totalAfterTax,
          lookupKey: lookupKey, // Thêm lookupKey
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
      where: { branchId: invoice.branchId, providerType: InvoiceProviderType.VNPT, isActive: true },
      include: { invConfig: true }
    })

    const providerData = {
      providerType: invoiceProvider.providerType,
      providerName: InvoiceProviderType.VNPT,
      isActive: invoiceProvider.isActive,
      config: {
        id: invoiceProvider.id,
        providerId: invoiceProvider.id,
        vnptApiUrl: invoiceProvider.invConfig.vnptApiUrl,
        vnptLookupUrl: invoiceProvider.invConfig.vnptLookupUrl,
        vnptUsername: invoiceProvider.invConfig.vnptUsername,
        vnptPassword: invoiceProvider.invConfig.vnptPassword,
        vnptAccount: invoiceProvider.invConfig.vnptAccount,
        vnptAccountPassword: invoiceProvider.invConfig.vnptAccountPassword,
        invPattern: invoiceProvider.invConfig.invPattern,
        invSerial: invoiceProvider.invConfig.invSerial
      }
    }

    const invoiceForVNPT = {
      ...invoice,
      invoiceDetails: invoiceData.invoiceDetails.map(detail => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        invoiceId: invoice.id,
        productName: detail.productName,
        productCode: detail.productCode || '',
        unit: detail.unit || '',
        unitPrice: detail.unitPrice,
        amount: detail.amount,
        vatRate: detail.vatRate || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    }

    return this.vnptProvider.exportInvoice(providerData, invoiceForVNPT)
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

  /**
   * Enrich invoice data with type based on TaxSetting if not specified
   */
  private enrichInvoiceWithType(invoiceData: CreateInvoiceDto, taxSetting: any): CreateInvoiceDto {
    // If invoice type is already specified, use it
    if (invoiceData.invoiceType) {
      return invoiceData
    }

    // Determine invoice type from TaxSetting
    const invoiceType =
      taxSetting?.taxMethod === TaxMethod.DEDUCTION
        ? InvoiceType.VAT_INVOICE
        : InvoiceType.SALES_INVOICE

    return {
      ...invoiceData,
      invoiceType
    }
  }
}
