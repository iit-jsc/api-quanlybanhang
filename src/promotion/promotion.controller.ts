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
  Query,
  Req,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import {
  CreatePromotionDto,
  ProductsOrderDto,
  UpdatePromotionDto,
} from './dto/promotion.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { RolesGuard } from 'guards/roles.guard';
import { Roles } from 'guards/roles.decorator';
import { SPECIAL_ROLE } from 'enums/common.enum';
import { FindManyPromotionDto } from './dto/find-many.dto';
@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_PROMOTION', SPECIAL_ROLE.MANAGER)
  create(@Body() createPromotionDto: CreatePromotionDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.promotionService.create(createPromotionDto, tokenPayload);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() findManyDto: FindManyPromotionDto,
    @Body() productsOrderDto: ProductsOrderDto,
  ) {
    return this.promotionService.findAll(findManyDto, productsOrderDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string) {
    return this.promotionService.findUniq({
      id,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_PROMOTION', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.promotionService.update(
      {
        where: {
          id,
        },
        data: updatePromotionDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_PROMOTION', SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.promotionService.deleteMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
