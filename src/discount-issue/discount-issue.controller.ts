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
import { DiscountIssueService } from './discount-issue.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { CreateDiscountIssueDto } from './dto/discount-issue.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { UpdatePromotionDto } from 'src/promotion/dto/promotion.dto';
import { Roles } from 'guards/roles.decorator';
import { SPECIAL_ROLE } from 'enums/common.enum';

@Controller('discount-issue')
export class DiscountIssueController {
  constructor(private readonly discountIssueService: DiscountIssueService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDiscountIssueDto: CreateDiscountIssueDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.discountIssueService.create(
      createDiscountIssueDto,
      tokenPayload,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.discountIssueService.findAll(findManyDto, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: number, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.discountIssueService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: number,
    @Body() updatePromotionDto: UpdatePromotionDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.discountIssueService.update(
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
  @UseGuards(JwtAuthGuard)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.discountIssueService.deleteMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
