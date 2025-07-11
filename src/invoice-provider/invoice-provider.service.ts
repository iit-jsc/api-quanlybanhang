import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { invoiceProviderSelect } from 'responses/invoice-provider.response'
import { UpdateAndActiveInvoiceProviderDto } from './dto/update-and-active-invoice-provider.dto'

@Injectable()
export class InvoiceProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(branchId: string) {
    return await this.prisma.invoiceProvider.findMany({
      where: {
        branchId: branchId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: invoiceProviderSelect
    })
  }

  async updateAndActive(
    data: UpdateAndActiveInvoiceProviderDto,
    branchId: string,
    updatedBy: string
  ) {
    return await this.prisma.$transaction(async prisma => {
      await prisma.invoiceProvider.updateMany({
        where: {
          branchId: branchId
        },
        data: {
          isActive: false,
          updatedBy: updatedBy
        }
      })

      return await prisma.invoiceProvider.update({
        where: {
          branchId_providerType: {
            branchId: branchId,
            providerType: data.providerType
          }
        },
        data: {
          isActive: true,
          invConfig: {
            update: {
              data: {
                vnptApiUrl: data.vnptApiUrl,
                vnptUsername: data.vnptUsername,
                vnptPassword: data.vnptPassword,
                vnptAccount: data.vnptAccount,
                vnptAccountPassword: data.vnptAccountPassword,
                invPattern: data.invPattern,
                invSerial: data.invSerial
              }
            }
          }
        },
        select: invoiceProviderSelect
      })
    })
  }
}
