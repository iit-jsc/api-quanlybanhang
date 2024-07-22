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
import { EmployeeGroupService } from "./employee-group.service";
import { CreateEmployeeGroupDto, UpdateEmployeeGroupDto } from "./dto/employee-group.dto";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { RolesGuard } from "guards/roles.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";

@Controller("employee-group")
export class EmployeeGroupController {
  constructor(private readonly employeeGroupService: EmployeeGroupService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_EMPLOYEE_GROUP", SPECIAL_ROLE.MANAGER)
  create(@Body() createEmployeeGroupDto: CreateEmployeeGroupDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.create(createEmployeeGroupDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    "CREATE_EMPLOYEE_GROUP",
    "UPDATE_EMPLOYEE_GROUP",
    "DELETE_EMPLOYEE_GROUP",
    "VIEW_EMPLOYEE_GROUP",
    SPECIAL_ROLE.MANAGER,
  )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    "CREATE_EMPLOYEE_GROUP",
    "UPDATE_EMPLOYEE_GROUP",
    "DELETE_EMPLOYEE_GROUP",
    "VIEW_EMPLOYEE_GROUP",
    SPECIAL_ROLE.MANAGER,
  )
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_EMPLOYEE_GROUP", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() updateEmployeeGroupDto: UpdateEmployeeGroupDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.update(
      {
        where: {
          id,
        },
        data: updateEmployeeGroupDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_EMPLOYEE_GROUP", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
