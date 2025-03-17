import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { TokenPayload } from 'interfaces/common.interface'
import { PrismaService } from 'nestjs-prisma'
import { UpdatePrintTemplateDto } from './dto/print-template.dto'
import { CommonService } from 'src/common/common.service'
import { ACTIVITY_LOG_TYPE } from 'enums/common.enum'

@Injectable()
export class PrintTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService
  ) {}

  async update(
    params: {
      data: UpdatePrintTemplateDto
    },
    tokenPayload: TokenPayload
  ) {
    const { data } = params

    const result = await this.prisma.printTemplate.upsert({
      where: {
        shopId_type: {
          shopId: tokenPayload.shopId,
          type: data.type
        }
      },
      create: {
        type: data.type,
        content: data.content,
        shopId: tokenPayload.shopId
      },
      update: {
        content: data.content,
        updatedBy: tokenPayload.accountId
      }
    })

    await this.commonService.createActivityLog(
      [result.id],
      'PrintTemplate',
      ACTIVITY_LOG_TYPE.UPDATE,
      tokenPayload
    )

    return result
  }

  async findUniq(
    where: Prisma.PrintTemplateWhereInput,
    tokenPayload: TokenPayload
  ) {
    return this.prisma.printTemplate.findUniqueOrThrow({
      where: {
        shopId_type: {
          shopId: tokenPayload.shopId,
          type: +where.type
        }
      }
    })
  }

  async findDefaultTemplate(
    where: Prisma.PrintTemplateWhereInput,
    tokenPayload: TokenPayload
  ) {
    return await this.prisma.printTemplate.findFirst({
      where: {
        type: +where.type,
        isDefault: true
      }
    })
  }
}
