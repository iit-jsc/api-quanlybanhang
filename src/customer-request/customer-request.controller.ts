import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CustomerRequestService } from './customer-request.service';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { CreateCustomerRequestDto, FindManyCustomerRequestDto, UpdateCustomerRequestDto } from './dto/customer-request.dto';
import { TokenPayload } from 'interfaces/common.interface';

@Controller('customer-request')
export class CustomerRequestController {
  constructor(private readonly customerRequestService: CustomerRequestService) { }

  @Post("")
  @HttpCode(HttpStatus.OK)
  create(@Body() createCustomerRequestDto: CreateCustomerRequestDto) {
    return this.customerRequestService.create(createCustomerRequestDto);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  findAll(@Query() data: FindManyCustomerRequestDto) {

    return this.customerRequestService.findAll(data);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customerRequestService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() updateCustomerRequestDto: UpdateCustomerRequestDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.customerRequestService.update(
      {
        where: {
          id,
        },
        data: updateCustomerRequestDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.customerRequestService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
