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
import { FutureUsageSettingService } from "./future-usage-setting.service";
import { UpdateFutureUsageSettingDto } from "./dto/update-future-usage-setting.dto";
import { FindUniqDto } from "utils/Common.dto";
import { TokenPayload } from "interfaces/common.interface";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";
import { RolesGuard } from "guards/roles.guard";

@Controller("future-usage-setting")
export class FutureUsageSettingController {
  constructor(private readonly futureUsageSettingService: FutureUsageSettingService) {}

  @Get(":futureCode")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SPECIAL_ROLE.STORE_OWNER)
  findUniq(@Param("futureCode") futureCode: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.futureUsageSettingService.findUniq(
      { shopId_futureCode: { futureCode: futureCode, shopId: tokenPayload.shopId } },
      tokenPayload,
    );
  }

  @Patch("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SPECIAL_ROLE.STORE_OWNER)
  update(@Body() updateFutureUsageSettingDto: UpdateFutureUsageSettingDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.futureUsageSettingService.update({ data: updateFutureUsageSettingDto }, tokenPayload);
  }
}
