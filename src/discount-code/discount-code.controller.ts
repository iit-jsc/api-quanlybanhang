import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DiscountCodeService } from './discount-code.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RolesGuard } from 'guards/roles.guard';
import { SPECIAL_ROLE } from 'enums/common.enum';
import { Roles } from 'guards/roles.decorator';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { CreateDiscountCodeDto } from './dto/discount-code.dto';

@Controller('discount-code')
export class DiscountCodeController {
  constructor(private readonly discountCodeService: DiscountCodeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_DISCOUNT_ISSUE', SPECIAL_ROLE.MANAGER)
  create(
    @Body() createDiscountCodeDto: CreateDiscountCodeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.discountCodeService.create(createDiscountCodeDto, tokenPayload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_DISCOUNT_ISSUE',
    'UPDATE_DISCOUNT_ISSUE',
    'DELETE_DISCOUNT_ISSUE',
    'VIEW_DISCOUNT_ISSUE',
    SPECIAL_ROLE.MANAGER,
  )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.discountCodeService.findAll(findManyDto, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_DISCOUNT_ISSUE',
    'UPDATE_DISCOUNT_ISSUE',
    'DELETE_DISCOUNT_ISSUE',
    'VIEW_DISCOUNT_ISSUE',
    SPECIAL_ROLE.MANAGER,
  )
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.discountCodeService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_DISCOUNT_ISSUE', SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.discountCodeService.deleteMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}