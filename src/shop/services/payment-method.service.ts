import { Injectable } from '@nestjs/common'
import { PrismaClient, PaymentMethodType } from '@prisma/client'

@Injectable()
export class PaymentMethodService {
  async createPaymentMethods(branchId: string, prisma: PrismaClient) {
    const paymentMethods = [
      {
        bankName: 'Vietcombank',
        bankCode: 'VCB123',
        representative: 'Nguyễn Văn A',
        type: PaymentMethodType.BANKING,
        active: false
      },
      {
        bankName: null,
        bankCode: null,
        representative: null,
        type: PaymentMethodType.CASH,
        active: true
      },
      {
        type: PaymentMethodType.VNPAY,
        active: false
      }
    ]

    const createdPaymentMethods = await prisma.paymentMethod.createMany({
      data: paymentMethods.map(paymentMethod => ({
        branchId,
        bankName: paymentMethod.bankName,
        bankCode: paymentMethod.bankCode,
        representative: paymentMethod.representative,
        type: paymentMethod.type,
        active: paymentMethod.active
      }))
    })

    console.log('✅ Created payment methods!')
    return createdPaymentMethods
  }
}
