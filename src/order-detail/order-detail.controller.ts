import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { OrderDetailService } from "./order-detail.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { RolesGuard } from "guards/roles.guard";
import { SPECIAL_ROLE } from "enums/common.enum";
import { UpdateOrderProductDto } from "src/order/dto/update-order-detail.dto";
import { Roles } from "guards/roles.decorator";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Controller("order-detail")
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @Patch("/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_ORDER", SPECIAL_ROLE.MANAGER)
  update(@Body() updateOrderProductDto: UpdateOrderProductDto, @Req() req: any, @Param("id") id: string) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderDetailService.update(
      {
        where: {
          id,
        },
        data: updateOrderProductDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_ORDER", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderDetailService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Roles("VIEW_ORDER", SPECIAL_ROLE.MANAGER)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderDetailService.findAll(findManyDto, tokenPayload);
  }

}
