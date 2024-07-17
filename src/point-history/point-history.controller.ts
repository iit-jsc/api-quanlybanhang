import { Controller, Get, HttpCode, HttpStatus, Param, Req, UseGuards } from "@nestjs/common";
import { PointHistoryService } from "./point-history.service";
import { JwtCustomerAuthGuard } from "guards/jwt-auth.guard";
import { TokenCustomerPayload } from "interfaces/common.interface";

@Controller("point-history")
export class PointHistoryController {
  constructor(private readonly pointHistoryService: PointHistoryService) {}

  @Get("/")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  findManyPointHistory(@Req() req: any) {
    const tokenPayload = req.tokenCustomerPayload as TokenCustomerPayload;

    return this.pointHistoryService.findManyPointHistory(tokenPayload);
  }

  @Get("/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  findUniqPointerHistory(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenCustomerPayload as TokenCustomerPayload;

    return this.pointHistoryService.findUniqPointerHistory({ id }, tokenPayload);
  }
}
