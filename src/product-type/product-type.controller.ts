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
import { v4 as isUuid } from "uuid";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindBySlugDto } from "utils/Common.dto";
import { ProductTypeService } from "./product-type.service";
import { CreateProductTypeDto, UpdateProductTypeDto } from "./dto/product-type.dto";
import { FindManyProductTypeDto } from "./dto/find-many.dto";
import { RolesGuard } from "guards/roles.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";

@Controller("product-type")
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) { }

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_PRODUCT_TYPE", SPECIAL_ROLE.MANAGER)
  create(@Body() createProductTypeDto: CreateProductTypeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.create(createProductTypeDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  findAll(@Query() findManyDto: FindManyProductTypeDto, @Req() req: any) {
    return this.productTypeService.findAll(findManyDto);
  }

  @Get(":keyword")
  @HttpCode(HttpStatus.OK)
  findUniq(@Param("keyword") keyword: string, @Query() findBySlugDto: FindBySlugDto) {
    const where = findBySlugDto.isSlug ? { slug: keyword } : { id: keyword };

    return this.productTypeService.findUniq({
      ...where,
      branchId: findBySlugDto.branchId,
    });
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_PRODUCT_TYPE", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() updateProductTypeDto: UpdateProductTypeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.update(
      {
        where: {
          id,
        },
        data: updateProductTypeDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_PRODUCT_TYPE", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productTypeService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
