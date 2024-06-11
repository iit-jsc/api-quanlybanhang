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
import { OrderRatingService } from './order-rating.service';
import { CreateOrderRatingDto } from './dto/create-order-rating.dto';
import { TokenCustomer } from 'interfaces/common.interface';
import { JwtCustomerAuthGuard } from 'guards/jwt-auth.guard';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { FindManyOrderRatings } from './dto/find-many-order-rating';

@Controller('order-rating')
export class OrderRatingController {
  constructor(private readonly orderRatingService: OrderRatingService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  create(@Body() createOrderRatingDto: CreateOrderRatingDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenCustomer;

    return this.orderRatingService.create(createOrderRatingDto, tokenPayload);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  update(
    @Param('id') id: number,
    @Body() createOrderRatingDto: CreateOrderRatingDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenCustomer;

    return this.orderRatingService.update(
      {
        where: {
          id,
        },
        data: createOrderRatingDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenCustomer;
    return this.orderRatingService.removeMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtCustomerAuthGuard)
  findAll(@Query() findManyDto: FindManyOrderRatings, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenCustomer;

    return this.orderRatingService.findAll(findManyDto, tokenPayload);
  }
}
