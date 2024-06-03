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
  @UseGuards(JwtAuthGuard, BranchGuard)
  createByCustomerWithTable(
    @Body()
    createOrderByCustomerWithTableDto: CreateOrderByCustomerWithTableDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.createByCustomerWithTable(
      createOrderByCustomerWithTableDto,
      tokenPayload,
    );
  }

  @Post('by-customer-online')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  createByCustomerOnline(
    @Body() CreateOrderByCustomerOnlineDto: CreateOrderByCustomerOnlineDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.createByCustomerOnline(
      CreateOrderByCustomerOnlineDto,
      tokenPayload,
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
  update(
    @Param('id') id: number,
    @Body() createOrderDto: CreateOrderByEmployeeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.update(
      {
        where: {
          id,
        },
        data: createOrderDto,
      },
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
