import { Injectable, UseGuards } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { UpdateTaxSettingDto } from './dto/tax-setting.dto'
import { ActivityAction } from '@prisma/client'
import { ActivityLogService } from 'src/activity-log/activity-log.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'

@Injectable()
@UseGuards(JwtAuthGuard)
export class TaxSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService
  ) {}

  async findUniq(branchId: string) {
    return this.prisma.taxSetting.findUniqueOrThrow({
      where: {
        branchId
      }
    })
  }

  async update(data: UpdateTaxSettingDto, accountId: string, branchId: string) {
    return this.prisma.$transaction(async prisma => {
      const taxSetting = await prisma.taxSetting.upsert({
        where: { branchId },
        update: {
          vatRateOption: data.vatRateOption,
          vatReductionOption: data.vatReductionOption,
          vatMethod: data.vatMethod,
          updatedBy: accountId
        },
        create: {
          branchId,
          vatRateOption: data.vatRateOption,
          vatReductionOption: data.vatReductionOption,
          vatMethod: data.vatMethod,
          updatedBy: accountId
        }
      })

      await this.activityLogService.create(
        {
          action: ActivityAction.UPDATE,
          modelName: 'TaxSetting',
          targetName: taxSetting.branchId,
          targetId: taxSetting.branchId
        },
        { branchId },
        accountId
      )

      return taxSetting
    })
  }
}
