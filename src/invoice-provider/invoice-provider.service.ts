import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { invoiceProviderSelect } from 'responses/invoice-provider.response'
import { UpdateAndActiveInvoiceProviderDto } from './dto/update-and-active-invoice-provider.dto'
import { encrypt } from 'utils/encrypt'

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

      return await prisma.invoiceProvider.upsert({
        where: {
          branchId_providerType: {
            branchId: branchId,
            providerType: data.providerType
          }
        },
        update: {
          isActive: true,
          invConfig: {
            update: {
              data: {
                vnptApiUrl: data.vnptApiUrl,
                vnptUsername: data.vnptUsername,
                vnptPassword: encrypt(data.vnptPassword),
                vnptAccount: data.vnptAccount,
                vnptAccountPassword: encrypt(data.vnptAccountPassword),
                invPattern: data.invPattern,
                invSerial: data.invSerial
              }
            }
          }
        },
        create: {
          isActive: true,
          branchId: branchId,
          providerType: data.providerType,
          createdBy: updatedBy,
          invConfig: {
            create: {
              vnptApiUrl: data.vnptApiUrl,
              vnptUsername: data.vnptUsername,
              vnptPassword: encrypt(data.vnptPassword),
              vnptAccount: data.vnptAccount,
              vnptAccountPassword: encrypt(data.vnptAccountPassword),
              invPattern: data.invPattern,
              invSerial: data.invSerial
            }
          }
        },
        select: invoiceProviderSelect
      })
    })
  }
}
