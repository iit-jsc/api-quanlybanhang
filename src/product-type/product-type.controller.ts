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
import { DeleteManyWithIdentifierDto, FindManyDTO } from 'utils/Common.dto';
import { ProductTypeService } from './product-type.service';
import { CreateProductTypeDTO } from './dto/create-product-type.dto';
import { UpdateProductTypeDTO } from './dto/update-product-type.dto';

@Controller('product-type')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  create(@Body() createProductTypeDto: CreateProductTypeDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.create(createProductTypeDto, tokenPayload);
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

  @Patch(':identifier')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  update(
    @Param('identifier') identifier: string,
    @Body() updateProductTypeDTO: UpdateProductTypeDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.update(
      {
        where: {
          identifier: identifier,
        },
        data: updateProductTypeDTO,
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
