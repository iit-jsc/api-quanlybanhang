import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { OrderDetailService } from "./order-detail.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { RolesGuard } from "guards/roles.guard";
import { SPECIAL_ROLE } from "enums/common.enum";
import { UpdateOrderProductDto } from "src/order/dto/update-order-detail.dto";
import { Roles } from "guards/roles.decorator";
import { TokenPayload } from "interfaces/common.interface";

@Controller("order-detail")
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @Patch("/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_ORDER", SPECIAL_ROLE.MANAGER)
  updateOrderDetail(@Body() updateOrderProductDto: UpdateOrderProductDto, @Req() req: any, @Param("id") id: string) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderDetailService.updateOrderDetail(
      {
        where: {
          id,
        },
        data: updateOrderProductDto,
      },
      tokenPayload,
    );
  }
}
