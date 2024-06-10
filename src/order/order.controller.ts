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
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderOnlineDto } from './dto/create-order-online.dto';
import { CreateOrderToTableDto } from './dto/create-order-to-table.dto';
import { CreateOrderToTableByCustomerDto } from './dto/create-order-to-table-by-customer.dto';
import { UpdateProductInTableDto } from './dto/update-product-in-table.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { PaymentFromTableDto } from './dto/payment-order-from-table.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CombineTableDto } from './dto/combine-table.dto';
import { SeparateTableDto } from './dto/separate-table.dto';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { SaveOrderDto } from './dto/save-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.create(createOrderDto, tokenPayload);
  }

  @Post('/online')
  @HttpCode(HttpStatus.OK)
  createOrderOnline(@Body() createOrderOnlineDto: CreateOrderOnlineDto) {
    return this.orderService.createOrderOnline(createOrderOnlineDto);
  }

  @Post('/to-table')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  createOrderToTableByEmployee(
    @Body() createOrderToTableDto: CreateOrderToTableDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.createOrderToTableByEmployee(
      createOrderToTableDto,
      tokenPayload,
    );
  }

  @Post('/to-table-by-customer')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  createOrderToTableByCustomer(
    @Body() createOrderToTableByCustomerDto: CreateOrderToTableByCustomerDto,
  ) {
    return this.orderService.createOrderToTableByCustomer(
      createOrderToTableByCustomerDto,
    );
  }

  @Patch('/detail/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  updateOrderDetail(
    @Body() updateOrderDetailDto: UpdateOrderDetailDto,
    @Req() req: any,
    @Param('id') id: number,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.updateOrderDetail(
      {
        where: {
          id,
        },
        data: updateOrderDetailDto,
      },
      tokenPayload,
    );
  }

  @Post('/payment-from-table')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  paymentFromTable(
    @Body() paymentFromTableDto: PaymentFromTableDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.paymentFromTable(
      paymentFromTableDto,
      tokenPayload,
    );
  }

  @Post('/combine-table')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  mergeTable(@Body() combineTableDto: CombineTableDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.mergeTable(combineTableDto, tokenPayload);
  }

  @Post('/separate-table')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  separateTable(@Body() separateTableDto: SeparateTableDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.separateTable(separateTableDto, tokenPayload);
  }

  @Patch('/:id/save')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  saveOrder(
    @Body() saveOrderDto: SaveOrderDto,
    @Req() req: any,
    @Param('id') id: number,
  ) {
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

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: any,
    @Param('id') id: number,
  ) {
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

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.findAll(findManyDto, tokenPayload);
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
  @UseGuards(JwtAuthGuard)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.orderService.removeMany(deleteManyDto, tokenPayload);
  }
}
