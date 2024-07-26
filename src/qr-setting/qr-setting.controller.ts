import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { QrSettingService } from "./qr-setting.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";
import { UpdateQRSettingDto } from "./dto/qr-setting.dto";
import { TokenPayload } from "interfaces/common.interface";

@Controller("qr-setting")
export class QrSettingController {
  constructor(private readonly qrSettingService: QrSettingService) {}

  @Patch("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Roles(SPECIAL_ROLE.STORE_OWNER)
  update(@Body() updateQRSettingDto: UpdateQRSettingDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.qrSettingService.update(updateQRSettingDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.qrSettingService.findUniq(tokenPayload);
  }
}
