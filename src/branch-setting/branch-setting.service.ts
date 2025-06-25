import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { UpdateBranchSetting } from './dto/branch-setting.dto'

@Injectable()
export class BranchSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateBranchSetting(data: UpdateBranchSetting, branchId: string, accountId: string) {
    return this.prisma.branchSetting.update({
      where: { branchId },
      data: {
        useKitchen: data.useKitchen,
        updatedBy: accountId
      }
    })
  }

  async getBranchSetting(branchId: string) {
    return this.prisma.branchSetting.findUnique({
      where: { branchId }
    })
  }
}
