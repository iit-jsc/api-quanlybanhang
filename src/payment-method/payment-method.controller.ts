import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PaymentMethodService } from "./payment-method.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { FindManyDto } from "utils/Common.dto";
import { TokenPayload } from "interfaces/common.interface";
import { UpdatePaymentMethodDto } from "./dto/payment-method.dto";

@Controller("payment-method")
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.paymentMethodService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.paymentMethodService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.paymentMethodService.update(
      {
        where: {
          id,
        },
        data: updatePaymentMethodDto,
      },
      tokenPayload,
    );
  }

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(@Body() updatePaymentMethodDto: UpdatePaymentMethodDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.paymentMethodService.create(
      {
        data: updatePaymentMethodDto,
      },
      tokenPayload,
    );
  }
}
