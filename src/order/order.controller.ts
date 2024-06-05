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
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { BranchGuard } from 'guards/branch.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { CreateOrderByEmployeeDto } from './dto/create-order-by-employee.dto';
import {
  CreateOrderByCustomerOnlineDto,
  CreateOrderByCustomerWithTableDto,
} from './dto/create-order-by-customer.dto';
import { approveOrderDto } from './dto/confirm-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('by-employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  createByEmployee(
    @Body() createOrderByEmployeeDto: CreateOrderByEmployeeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.createByEmployee(
      createOrderByEmployeeDto,
      tokenPayload,
    );
  }

  @Post('by-customer-with-table')
  @HttpCode(HttpStatus.OK)
  createByCustomerWithTable(
    @Body()
    createOrderByCustomerWithTableDto: CreateOrderByCustomerWithTableDto,
  ) {
    return this.orderService.createByCustomerWithTable(
      createOrderByCustomerWithTableDto,
    );
  }

  @Post('by-customer-online')
  @HttpCode(HttpStatus.OK)
  createByCustomerOnline(
    @Body() CreateOrderByCustomerOnlineDto: CreateOrderByCustomerOnlineDto,
  ) {
    return this.orderService.createByCustomerOnline(
      CreateOrderByCustomerOnlineDto,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.findAll(findManyDto, tokenPayload);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  approveOrder(
    @Param('id') id: number,
    @Req() req: any,
    @Body() approveOrderDto: approveOrderDto,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.approveOrder(
      {
        id,
      },
      approveOrderDto,
      tokenPayload,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: number, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {}
}
