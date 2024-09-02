import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Param,
  Patch,
  Delete,
  Query,
  Get,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CheckUniqDto, CreateEmployeeDto, UpdateEmployeeDto } from "./dto/employee-dto";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { RolesGuard } from "guards/roles.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/employee")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_EMPLOYEE", SPECIAL_ROLE.MANAGER)
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.createEmployee(createEmployeeDto, tokenPayload);
  }

  @Post("/check-unique")
  @HttpCode(HttpStatus.OK)
  checkUniq(@Body() checkUniqDto: CheckUniqDto, @Req() req: any) {
    return this.userService.checkUniq(checkUniqDto);
  }

  @Get("/employee")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_EMPLOYEE", "UPDATE_EMPLOYEE", "DELETE_EMPLOYEE", "VIEW_EMPLOYEE", SPECIAL_ROLE.MANAGER)
  findAllEmployee(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.findAllEmployee(findManyDto, tokenPayload);
  }

  @Get("/employee/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_EMPLOYEE", "UPDATE_EMPLOYEE", "DELETE_EMPLOYEE", "VIEW_EMPLOYEE", SPECIAL_ROLE.MANAGER)
  findUniqEmployee(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.findUniqEmployee(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch("/employee/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_EMPLOYEE", SPECIAL_ROLE.MANAGER)
  updateEmployee(@Param("id") id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.updateEmployee(
      {
        where: {
          id,
        },
        data: updateEmployeeDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_EMPLOYEE", SPECIAL_ROLE.MANAGER)
  deleteManyEmployee(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.userService.deleteManyEmployee(deleteManyDto, tokenPayload);
  }
}
