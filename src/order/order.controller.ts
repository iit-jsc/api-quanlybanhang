import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { JwtAuthGuard, JwtCustomerAuthGuard } from "guards/jwt-auth.guard";
import { TokenCustomerPayload, TokenPayload } from "interfaces/common.interface";
import { PaymentOrderDto, CreateOrderDto, UpdateOrderDto, FindManyOrderDto } from "./dto/order.dto";
import { CreateOrderOnlineDto } from "./dto/create-order-online.dto";
import { CreateOrderToTableDto } from "./dto/create-order-to-table.dto";
import { CreateOrderToTableByCustomerDto } from "./dto/create-order-to-table-by-customer.dto";
import { PaymentFromTableDto } from "./dto/payment-order-from-table.dto";
import { SeparateTableDto } from "./dto/separate-table.dto";
import { DeleteManyDto } from "utils/Common.dto";
import { SaveOrderDto } from "./dto/save-order.dto";
import { RolesGuard } from "guards/roles.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_ORDER", SPECIAL_ROLE.MANAGER)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.create(createOrderDto, tokenPayload);
  }

  @Post("/online")
  @HttpCode(HttpStatus.OK)
  createOrderOnline(@Body() createOrderOnlineDto: CreateOrderOnlineDto, @Req() req: any) {
    return this.orderService.createOrderOnline(createOrderOnlineDto);
  }

  @Post("/to-table")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_ORDER", SPECIAL_ROLE.MANAGER)
  createOrderToTableByEmployee(@Body() createOrderToTableDto: CreateOrderToTableDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.createOrderToTableByEmployee(createOrderToTableDto, tokenPayload);
  }

  @Post("/to-table-by-customer")
  @HttpCode(HttpStatus.OK)
  createOrderToTableByCustomer(@Body() createOrderToTableByCustomerDto: CreateOrderToTableByCustomerDto) {
    return this.orderService.createOrderToTableByCustomer(createOrderToTableByCustomerDto);
  }

  @Post("/payment-from-table")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_ORDER", SPECIAL_ROLE.MANAGER)
  paymentFromTable(@Body() paymentFromTableDto: PaymentFromTableDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.paymentFromTable(paymentFromTableDto, tokenPayload);
  }

  @Post("/separate-table")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_ORDER", SPECIAL_ROLE.MANAGER)
  separateTable(@Body() separateTableDto: SeparateTableDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.separateTable(separateTableDto, tokenPayload);
  }

  @Patch("/:id/save")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_ORDER", SPECIAL_ROLE.MANAGER)
  saveOrder(@Body() saveOrderDto: SaveOrderDto, @Req() req: any, @Param("id") id: string) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.saveOrder(
      {
        where: {
          id,
        },
        data: saveOrderDto,
      },
      tokenPayload,
    );
  }

  @Post("/:id/payment")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_ORDER", SPECIAL_ROLE.MANAGER)
  paymentOrder(@Body() paymentOrderDto: PaymentOrderDto, @Req() req: any, @Param("id") id: string) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.paymentOrder(
      {
        where: {
          id,
        },
        data: paymentOrderDto,
      },
      tokenPayload,
    );
  }

  @Patch("/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_ORDER", SPECIAL_ROLE.MANAGER)
  update(@Body() updateOrderDto: UpdateOrderDto, @Req() req: any, @Param("id") id: string) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.update(
      {
        where: {
          id,
        },
        data: updateOrderDto,
      },
      tokenPayload,
    );
  }

  @Get("/me")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  findAllByCustomer(@Query() data: FindManyOrderDto, @Req() req: any) {
    const tokenCustomerPayload = req.tokenCustomerPayload as TokenCustomerPayload;

    return this.orderService.findAllByCustomer(data, tokenCustomerPayload);
  }

  @Get("/me/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  findUniqByCustomer(@Param("id") id: string, @Req() req: any) {
    const tokenCustomerPayload = req.tokenCustomerPayload as TokenCustomerPayload;

    return this.orderService.findUniqByCustomer(
      {
        id,
      },
      tokenCustomerPayload,
    );
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("VIEW_ORDER", SPECIAL_ROLE.MANAGER)
  findAll(@Query() data: FindManyOrderDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.findAll(data, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("VIEW_ORDER", SPECIAL_ROLE.MANAGER)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.findUniq(
      {
        id,
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

    return this.orderService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
