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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import {
  DeleteManyDto,
  DeleteManyWithIdentifierDto,
  FindManyDto,
} from 'utils/Common.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CustomFilesInterceptor } from 'utils/Helps';
import { FindManyProductDto } from './dto/find-many.dto';
import { RolesGuard } from 'guards/roles.guard';
import { Roles } from 'guards/roles.decorator';
import { SPECIAL_ROLE } from 'enums/common.enum';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_PRODUCT', SPECIAL_ROLE.MANAGER)
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productService.create(createProductDto, tokenPayload);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() findManyDto: FindManyProductDto, @Req() req: any) {
    return this.productService.findAll(findManyDto);
  }

  @Get(':keyword')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('keyword') keyword: string) {
    const idKeyword = Number(keyword);
    const searchConditions = !isNaN(idKeyword)
      ? [{ id: idKeyword }, { slug: { contains: keyword } }]
      : [{ slug: { contains: keyword } }];

    return this.productService.findUniq({
      OR: searchConditions,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_PRODUCT', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: number,
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productService.update(
      {
        where: {
          id,
        },
        data: createProductDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_PRODUCT', SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productService.removeMany(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
