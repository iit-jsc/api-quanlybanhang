import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CommonService } from 'src/common/common.service'

@Injectable()
export class FeatureUsageSettingService {
  constructor(
    private readonly prisma: PrismaService,
    private commonService: CommonService
  ) {}

  // async findUniq(
  //   featureCode: string,
  //   findUniqDto: FindUniqFutureUsageSettingDto
  // ) {
  //   const { branchId, shopId } = findUniqDto

  //   return this.prisma.featureUsageSetting.findFirst({
  //     where: {
  //       ...(branchId && {
  //         shop: {
  //           branches: {
  //             some: {
  //               id: branchId
  //             }
  //           }
  //         }
  //       }),
  //       ...(shopId && { shopId }),
  //       featureCode
  //     },
  //     include: {
  //       shop: {
  //         select: {
  //           id: true,
  //           address: true,
  //           code: true,
  //           name: true,
  //           email: true,
  //           domain: true,
  //           phone: true,
  //           photoURL: true,
  //           updatedAt: true,
  //           branches: {
  //             select: {
  //               id: true,
  //               name: true,
  //               address: true,
  //               photoURL: true,
  //               phone: true,
  //               bannerURL: true
  //             },
  //             where: {
  //               id: branchId
  //             }
  //           }
  //         }
  //       }
  //     }
  //   })
  // }

  // async update(
  //   params: { data: UpdateFeatureUsageSettingDto },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { data } = params
  //   const result = await this.prisma.featureUsageSetting.upsert({
  //     where: {
  //       shopId_featureCode: {
  //         featureCode: data.featureCode,
  //         shopId: tokenPayload.shopId
  //       }
  //     },
  //     create: {
  //       featureCode: data.featureCode,
  //       shopId: tokenPayload.shopId,
  //       isUsed: data.isUsed,
  //       updatedBy: tokenPayload.accountId
  //     },
  //     update: {
  //       isUsed: data.isUsed,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })

  //   await this.commonService.createActivityLog(
  //     [result.featureCode],
  //     'FeatureUsageSetting',
  //     ACTIVITY_LOG_TYPE.UPDATE,
  //     tokenPayload
  //   )

  //   return result
  // }
}
