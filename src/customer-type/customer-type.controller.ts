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
import { CreateProductTypeDTO } from 'src/product-type/dto/create-product-type.dto';
import { UpdateProductTypeDTO } from 'src/product-type/dto/update-product-type.dto';
import { DeleteManyWithIdentifierDto, FindManyDTO } from 'utils/Common.dto';
import { CustomerTypeService } from './customer-type.service';

@Controller('customer-type')
export class CustomerTypeController {
  constructor(private readonly customTypeService: CustomerTypeService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  create(@Body() createProductTypeDto: CreateProductTypeDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customTypeService.create(createProductTypeDto, tokenPayload);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDTO: FindManyDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customTypeService.findAll(findManyDTO, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customTypeService.findUniq(
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

    return this.customTypeService.update(
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

    return this.customTypeService.removeMany(
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
