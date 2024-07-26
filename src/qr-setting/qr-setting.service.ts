import { Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { UpdateQRSettingDto } from "./dto/qr-setting.dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class QrSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async update(data: UpdateQRSettingDto, tokenPayload: TokenPayload) {
    console.log(tokenPayload.shopId);

    return this.prisma.qRSetting.upsert({
      where: { shopId: tokenPayload.shopId },
      create: {
        isShowLogo: data.isShowLogo,
        isShowWifi: data.isShowWifi,
        isShowShopName: data.isShowShopName,
        isShowBranchName: data.isShowBranchName,
        isShowTable: data.isShowTable,
        description: data.description,
        updatedBy: tokenPayload.accountId,
        shopId: tokenPayload.shopId,
      },
      update: {
        isShowLogo: data.isShowLogo,
        isShowWifi: data.isShowWifi,
        isShowTable: data.isShowTable,
        isShowShopName: data.isShowShopName,
        isShowBranchName: data.isShowBranchName,
        description: data.description,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findUniq(tokenPayload: TokenPayload) {
    console.log(tokenPayload.shopId);

    return this.prisma.qRSetting.findFirstOrThrow({
      where: {
        shopId: tokenPayload.shopId,
      },
    });
  }
}
