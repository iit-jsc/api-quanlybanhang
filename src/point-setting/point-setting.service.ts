import { Injectable } from '@nestjs/common'

@Injectable()
export class PointSettingService {
  // constructor(
  //   private readonly prisma: PrismaService,
  //   private commonService: CommonService
  // ) {}
  // async update(
  //   params: {
  //     data: UpdatePointSettingDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { data } = params
  //   const result = await this.prisma.pointSetting.upsert({
  //     where: {
  //       shopId: tokenPayload.shopId
  //     },
  //     create: {
  //       value: data.value,
  //       active: data.active,
  //       point: data.point,
  //       shopId: tokenPayload.shopId,
  //       updatedBy: tokenPayload.accountId
  //     },
  //     update: {
  //       value: data.value,
  //       active: data.active,
  //       point: data.point,
  //       updatedBy: tokenPayload.accountId
  //     }
  //   })
  //   await this.commonService.createActivityLog(
  //     [result.id],
  //     'PointSetting',
  //     ACTIVITY_LOG_TYPE.UPDATE,
  //     tokenPayload
  //   )
  //   return result
  // }
  // async findUniq(tokenPayload: TokenPayload) {
  //   return this.prisma.pointSetting.findUniqueOrThrow({
  //     where: {
  //       shopId: tokenPayload.shopId
  //     }
  //   })
  // }
}
