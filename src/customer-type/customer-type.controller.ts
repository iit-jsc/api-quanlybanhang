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
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { CustomerTypeService } from "./customer-type.service";
import { CreateCustomerTypeDto, UpdateCustomerTypeDto } from "./dto/create-customer-type";
import { Roles } from "guards/roles.decorator";
import { RolesGuard } from "guards/roles.guard";
import { SPECIAL_ROLE } from "enums/common.enum";

@Controller("customer-type")
export class CustomerTypeController {
  constructor(private readonly customerTypeService: CustomerTypeService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_CUSTOMER_TYPE", SPECIAL_ROLE.MANAGER)
  create(@Body() createCustomerTypeDto: CreateCustomerTypeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customerTypeService.create(createCustomerTypeDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    "CREATE_CUSTOMER_TYPE",
    "UPDATE_CUSTOMER_TYPE",
    "DELETE_CUSTOMER_TYPE",
    "VIEW_CUSTOMER_TYPE",
    SPECIAL_ROLE.MANAGER,
  )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customerTypeService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    "CREATE_CUSTOMER_TYPE",
    "UPDATE_CUSTOMER_TYPE",
    "DELETE_CUSTOMER_TYPE",
    "VIEW_CUSTOMER_TYPE",
    SPECIAL_ROLE.MANAGER,
  )
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customerTypeService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_CUSTOMER_TYPE", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() updateCustomerTypeDto: UpdateCustomerTypeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.customerTypeService.update(
      {
        where: {
          id,
        },
        data: updateCustomerTypeDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_CUSTOMER_TYPE", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.customerTypeService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
