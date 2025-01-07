import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CheckEmailDto, CreateCustomerDto, FindManyCustomerDto, UpdateCustomerDto } from "./dto/customer.dto";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { RolesGuard } from "guards/roles.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";

@Controller("customer")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_CUSTOMER", SPECIAL_ROLE.MANAGER)
  create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customerService.create(createCustomerDto, tokenPayload);
  }


  @Post("check-email")
  @HttpCode(HttpStatus.OK)
  checkEmailExisted(@Body() data: CheckEmailDto) {

    return this.customerService.checkEmailExisted(data);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_CUSTOMER", "UPDATE_CUSTOMER", "DELETE_CUSTOMER", "VIEW_CUSTOMER", SPECIAL_ROLE.MANAGER)
  findAll(@Query() data: FindManyCustomerDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.customerService.findAll(data, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_CUSTOMER", "UPDATE_CUSTOMER", "DELETE_CUSTOMER", "VIEW_CUSTOMER", SPECIAL_ROLE.MANAGER)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.customerService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_CUSTOMER", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.customerService.update(
      {
        where: {
          id,
        },
        data: updateCustomerDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_CUSTOMER", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.customerService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
