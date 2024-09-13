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
import { ProductOptionGroupService } from "./product-option-group.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { Roles } from "guards/roles.decorator";
import { RolesGuard } from "guards/roles.guard";
import { SPECIAL_ROLE } from "enums/common.enum";
import { CreateProductOptionGroupDto, UpdateProductOptionGroupDto } from "./dto/product-option-group.dto";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Controller("product-option-group")
export class ProductOptionGroupController {
  constructor(private readonly productOptionGroupService: ProductOptionGroupService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_PRODUCT_OPTION_GROUP", SPECIAL_ROLE.MANAGER)
  create(@Body() createProductOptionGroupDto: CreateProductOptionGroupDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productOptionGroupService.create(createProductOptionGroupDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productOptionGroupService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productOptionGroupService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_PRODUCT_OPTION_GROUP", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() UpdateProductOptionGroupDto: UpdateProductOptionGroupDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productOptionGroupService.update(
      {
        where: {
          id,
        },
        data: UpdateProductOptionGroupDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_PRODUCT_OPTION_GROUP", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.productOptionGroupService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
