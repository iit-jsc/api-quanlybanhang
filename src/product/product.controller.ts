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
import { BranchGuard } from 'guards/branch.guard';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyWithIdentifierDto, FindManyDto } from 'utils/Common.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CustomFilesInterceptor } from 'utils/Helps';
import { FindManyProductDto } from './dto/find-many.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  @UseInterceptors(CustomFilesInterceptor('photoURLs', 10))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    const photoURLs = files.map((file) => file.path);

    return this.productService.create(
      { ...createProductDto, photoURLs },
      tokenPayload,
    );
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

  @Patch(':identifier')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  @UseInterceptors(CustomFilesInterceptor('photoURLs', 10))
  update(
    @Param('identifier') identifier: string,
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    const photoURLs = files.map((file) => file.path);

    return this.productService.update(
      {
        where: {
          identifier: identifier,
        },
        data: { ...createProductDto, photoURLs },
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

    return this.productService.removeMany(
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
