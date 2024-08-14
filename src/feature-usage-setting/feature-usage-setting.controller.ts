import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { FeatureUsageSettingService } from "./feature-usage-setting.service";
import { TokenPayload } from "interfaces/common.interface";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";
import { RolesGuard } from "guards/roles.guard";
import { UpdateFeatureUsageSettingDto } from "./dto/update-future-usage-setting.dto";

@Controller("feature-usage-setting")
export class FeatureUsageSettingController {
  constructor(private readonly featureUsageSettingService: FeatureUsageSettingService) {}

  @Get(":featureCode")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SPECIAL_ROLE.STORE_OWNER)
  findUniq(@Param("featureCode") featureCode: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.featureUsageSettingService.findUniq(
      { shopId_featureCode: { featureCode: featureCode, shopId: tokenPayload.shopId } },
      tokenPayload,
    );
  }

  @Patch("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SPECIAL_ROLE.STORE_OWNER)
  update(@Body() updateFeatureUsageSettingDto: UpdateFeatureUsageSettingDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.featureUsageSettingService.update({ data: updateFeatureUsageSettingDto }, tokenPayload);
  }
}
