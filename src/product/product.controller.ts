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
} from "@nestjs/common";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindBySlugDto } from "utils/Common.dto";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { FindManyProductDto } from "./dto/find-many.dto";
import { RolesGuard } from "guards/roles.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";
import { v4 as isUuid } from "uuid";
import { equal } from "assert";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_PRODUCT", SPECIAL_ROLE.MANAGER)
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productService.create(createProductDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  findAll(@Query() findManyDto: FindManyProductDto, @Req() req: any) {
    return this.productService.findAll(findManyDto);
  }

  @Get(":slug")
  @HttpCode(HttpStatus.OK)
  findUniq(@Param("slug") slug: string, @Query() findBySlugDto: FindBySlugDto) {
    return this.productService.findUniq({
      slug,
      branchId: findBySlugDto.branchId,
    });
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_PRODUCT", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productService.update(
      {
        where: {
          id,
        },
        data: updateProductDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_PRODUCT", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
