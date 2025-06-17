import { Injectable } from '@nestjs/common'
import { SetupMerchantDto } from './dto/merchant.dto'
import { CreateQrCodeDto } from './dto/qrCode.dto'
import { CheckTransactionDto } from './dto/check-transaction.dto'
import { VNPayIPNDto } from './dto/vnpay-ipn.dto'
import {
  MerchantService,
  ChecksumService,
  QrCodeService,
  TransactionService,
  VNPayOrderService,
  PaymentCallbackService,
  CheckTransactionService
} from './services'

export interface VnpayParams {
  [key: string]: any
}

// Re-export type for backward compatibility
export type { MerchantInfo } from './services/merchant.service'

@Injectable()
export class VNPayService {
  constructor(
    private readonly merchantService: MerchantService,
    private readonly checksumService: ChecksumService,
    private readonly qrCodeService: QrCodeService,
    private readonly transactionService: TransactionService,
    private readonly vnPayOrderService: VNPayOrderService,
    private readonly paymentCallbackService: PaymentCallbackService,
    private readonly checkTransactionService: CheckTransactionService
  ) {}

  async setupMerchant(data: SetupMerchantDto) {
    return this.merchantService.setupMerchant(data)
  }

  async generateQrCode(data: CreateQrCodeDto, branchId: string, accountId: string) {
    const merchantInfo = await this.merchantService.getMerchantInfo(branchId)

    // check bàn có đang thanh toán hay không?
    await this.transactionService.checkExistingTransaction(data.tableId)

    const orderDraft = await this.vnPayOrderService.createOrderByTableId(data, accountId, branchId)

    const payload = this.checksumService.buildVNPayPayload(
      merchantInfo,
      orderDraft.orderTotal.toString(),
      orderDraft.code
    )

    const qrCode = await this.qrCodeService.createQrCode(payload)

    // Tạo vNPayTransaction
    await this.transactionService.createTransaction(
      branchId,
      orderDraft.id,
      data.tableId,
      orderDraft.code
    )

    return {
      qrCode,
      order: orderDraft
    }
  }

  async getMerchantInfo(branchId: string) {
    return this.merchantService.getMerchantInfo(branchId)
  }

  async deleteTransactionByTableId(tableId: string, branchId: string) {
    return this.transactionService.deleteTransactionByTableId(tableId, branchId)
  }

  async checkTransaction(dto: CheckTransactionDto, branchId: string) {
    return this.checkTransactionService.checkTransaction(dto, branchId)
  }

  async vnPayIPNCallback(ipnDto: VNPayIPNDto) {
    return this.paymentCallbackService.vnPayIPNCallback(ipnDto)
  }
}
