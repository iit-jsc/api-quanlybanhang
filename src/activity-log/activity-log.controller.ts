import { Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards } from "@nestjs/common";
import { ActivityLogService } from "./activity-log.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { FindManyDto } from "utils/Common.dto";
import { TokenPayload } from "interfaces/common.interface";

@Controller("activity-log")
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.activityLogService.findAll(findManyDto, tokenPayload);
  }
}
