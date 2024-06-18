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
import { DeleteManyWithIdentifierDto } from 'utils/Common.dto';
import { ProductTypeService } from './product-type.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { FindManyProductTypeDto } from './dto/find-many.dto';

@Controller('product-type')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  create(@Body() createProductTypeDto: CreateProductTypeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.create(createProductTypeDto, tokenPayload);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyProductTypeDto, @Req() req: any) {
    return this.productTypeService.findAll(findManyDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: number) {
    return this.productTypeService.findUniq({
      id,
    });
  }

  @Patch(':identifier')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  update(
    @Param('identifier') identifier: string,
    @Body() createProductTypeDto: CreateProductTypeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.update(
      {
        where: {
          identifier: identifier,
        },
        data: createProductTypeDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  deleteMany(
    @Body() deleteManyDto: DeleteManyWithIdentifierDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.removeMany(
      {
        identifier: {
          in: deleteManyDto.identifiers,
        },
        branch: {
          id: {
            in: deleteManyDto.branchIds,
          },
        },
      },
      tokenPayload,
    );
  }
}
