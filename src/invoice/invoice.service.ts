import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateInvoiceDto } from './dto/invoice.dto'
import { FindManyDto } from 'utils/Common.dto'

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(data: CreateInvoiceDto, accountId: string, branchId: string) {
    // Kiểm tra order có tồn tại và thuộc về branch không
    console.log('Creating invoice for order:', data.orderId, 'in branch:', branchId, accountId)
  }

  async getInvoicesByBranch(data: FindManyDto, branchId: string) {
    console.log('Fetching invoices for branch:', branchId, 'with filter:', data)
  }

  async getInvoiceById(id: string, branchId: string) {
    return await this.prisma.invoice.findUniqueOrThrow({
      where: {
        id: id,
        branchId: branchId
      },
      include: {
        order: {
          include: {
            orderDetails: {
              include: {
                productOrigin: true
              }
            }
          }
        },
        invoiceDetails: true,
        creator: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    })
  }
  private calculateVATAmount(amount: number, vatRate: number): number {
    return Math.round(((amount * vatRate) / 100) * 100) / 100
  }
}
