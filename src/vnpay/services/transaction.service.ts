import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { TransactionStatus } from '@prisma/client'

@Injectable()
export class VNPayTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(branchId: string, orderId: string, tableId: string, vnpTxnRef: string) {
    return this.prisma.vNPayTransaction.create({
      data: {
        branchId,
        orderId,
        tableId,
        vnpTxnRef,
        status: TransactionStatus.PENDING
      }
    })
  }

  async checkExistingTransaction(tableId: string) {
    const existingTransaction = await this.prisma.vNPayTransaction.findFirst({
      where: {
        tableId,
        status: TransactionStatus.PENDING
      },
      select: { table: true }
    })

    if (existingTransaction) {
      throw new HttpException(
        `Bàn ${existingTransaction.table.name} đang có giao dịch đang xử lý!`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async deleteTransactionByTableId(tableId: string, branchId: string) {
    // Xóa hết đơn nháp
    await this.prisma.order.deleteMany({ where: { tableId, isDraft: true, branchId } })

    await this.prisma.vNPayTransaction.deleteMany({
      where: { tableId, status: TransactionStatus.PENDING, branchId }
    })
  }

  async getTransactionByTxnId(txnId: string) {
    return this.prisma.vNPayTransaction.findUnique({
      where: { vnpTxnRef: txnId },
      include: { order: true }
    })
  }

  async updateTransactionStatus(txnId: string, status: TransactionStatus) {
    return this.prisma.vNPayTransaction.update({
      where: { vnpTxnRef: txnId },
      data: { status }
    })
  }
}
