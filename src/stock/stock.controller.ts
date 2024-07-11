import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { FindManyDto } from 'utils/Common.dto';
import { TokenPayload } from 'interfaces/common.interface';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.stockService.findAll(findManyDto, tokenPayload);
  }
}
