import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PointAccumulationService } from './point-accumulation.service';
import { JwtAuthGuard, JwtCustomerAuthGuard } from 'guards/jwt-auth.guard';
import {
  TokenCustomerPayload,
  TokenPayload,
} from 'interfaces/common.interface';

@Controller('point-accumulation')
export class PointAccumulationController {
  constructor(
    private readonly pointAccumulationService: PointAccumulationService,
  ) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  getPointByCustomer(@Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenCustomerPayload;

    return this.pointAccumulationService.getPointByCustomer(tokenPayload);
  }

  @Get('/:customerId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getPointByShop(@Param('customerId') customerId: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.pointAccumulationService.getPointByShop(
      { customerId },
      tokenPayload,
    );
  }
}
