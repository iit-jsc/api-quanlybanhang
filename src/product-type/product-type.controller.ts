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
import { BranchGuard } from 'guards/branch.guard';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDTO } from 'utils/Common.dto';
import { ProductTypeService } from './product-type.service';
import { CreateCategoryDTO } from './dto/create-product-type.dto';

@Controller('product-type')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  create(@Body() createEmployeeGroupDto: CreateCategoryDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.create(createEmployeeGroupDto, tokenPayload);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDTO: FindManyDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.findAll(findManyDTO, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.findUniq(
      {
        id: +id,
      },
      tokenPayload,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  update(
    @Param('id') id: string,
    @Body() createEmployeeGroupDto: CreateCategoryDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.update(
      {
        where: {
          id: +id,
        },
        data: createEmployeeGroupDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  deleteMany(
    @Param('id') id: string,
    @Body() deleteManyDto: DeleteManyDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.removeMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
