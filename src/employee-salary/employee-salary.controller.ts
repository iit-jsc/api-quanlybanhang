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
import { EmployeeSalaryService } from "./employee-salary.service";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { TokenPayload } from "interfaces/common.interface";
import { CreateEmployeeSalaryDto, UpdateEmployeeSalaryDto } from "./dto/employee-salary.dto";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { RolesGuard } from "guards/roles.guard";
import { SPECIAL_ROLE } from "enums/common.enum";
import { Roles } from "guards/roles.decorator";

@Controller("employee-salary")
export class EmployeeSalaryController {
  constructor(private readonly employeeSalaryService: EmployeeSalaryService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  // @Roles("CREATE_EMPLOYEE_SCHEDULE", SPECIAL_ROLE.MANAGER)
  @UseGuards(JwtAuthGuard)
  create(@Body() createEmployeeSalaryDto: CreateEmployeeSalaryDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeSalaryService.create(createEmployeeSalaryDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  // @Roles(
  //   "CREATE_EMPLOYEE_SCHEDULE",
  //   "UPDATE_EMPLOYEE_SCHEDULE",
  //   "DELETE_EMPLOYEE_SCHEDULE",
  //   "VIEW_EMPLOYEE_SCHEDULE",
  //   SPECIAL_ROLE.MANAGER,
  // )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeSalaryService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  // @Roles(
  //   "CREATE_EMPLOYEE_SCHEDULE",
  //   "UPDATE_EMPLOYEE_SCHEDULE",
  //   "DELETE_EMPLOYEE_SCHEDULE",
  //   "VIEW_EMPLOYEE_SCHEDULE",
  //   SPECIAL_ROLE.MANAGER,
  // )
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeSalaryService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  // @Roles("UPDATE_EMPLOYEE_SCHEDULE", SPECIAL_ROLE.MANAGER)
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() updateEmployeeSalaryDto: UpdateEmployeeSalaryDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeSalaryService.update(
      {
        where: {
          id,
        },
        data: updateEmployeeSalaryDto,
      },
      tokenPayload,
    );
  }
}
