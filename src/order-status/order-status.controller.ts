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
import { OrderStatusService } from './order-status.service';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { TokenPayload } from 'interfaces/common.interface';

@Controller('order-status')
export class OrderStatusController {
  // constructor(private readonly orderStatusService: OrderStatusService) {}
  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // create(@Body() createOrderStatusDto: CreateOrderStatusDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;
  //   return this.orderStatusService.create(createOrderStatusDto, tokenPayload);
  // }
  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;
  //   return this.orderStatusService.findAll(findManyDto, tokenPayload);
  // }
  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // findUniq(@Param('id') id: number, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;
  //   return this.orderStatusService.findUniq(
  //     {
  //       id,
  //     },
  //     tokenPayload,
  //   );
  // }
  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // update(
  //   @Param('id') id: number,
  //   @Body() createOrderStatusDto: CreateOrderStatusDto,
  //   @Req() req: any,
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;
  //   return this.orderStatusService.update(
  //     {
  //       where: {
  //         id,
  //       },
  //       data: createOrderStatusDto,
  //     },
  //     tokenPayload,
  //   );
  // }
  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;
  //   return this.orderStatusService.removeMany(
  //     {
  //       id: {
  //         in: deleteManyDto.ids,
  //       },
  //     },
  //     tokenPayload,
  //   );
  // }
}
