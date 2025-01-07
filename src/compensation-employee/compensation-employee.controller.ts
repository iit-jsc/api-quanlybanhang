import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CompensationEmployeeService } from "./compensation-employee.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { CreateCompensationEmployeeDto, FindManyCompensationEmployeeDto, UpdateCompensationEmployeeDto } from "./dto/compensation-employee.dto";
import { FindManyDto } from "utils/Common.dto";
import { RolesGuard } from "guards/roles.guard";
import { SPECIAL_ROLE } from "enums/common.enum";
import { Roles } from "guards/roles.decorator";

@Controller("compensation-employee")
export class CompensationEmployeeController {
  constructor(private readonly compensationEmployeeService: CompensationEmployeeService) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_SALARY", "UPDATE_SALARY", "DELETE_SALARY", "VIEW_SALARY", SPECIAL_ROLE.MANAGER)
  findAll(@Query() data: FindManyCompensationEmployeeDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.compensationEmployeeService.findAll(data, tokenPayload);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_SALARY", SPECIAL_ROLE.MANAGER)
  update(
    @Param("id") id: string,
    @Body() updateCompensationEmployeeDto: UpdateCompensationEmployeeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.compensationEmployeeService.update(
      {
        where: {
          id,
        },
        data: updateCompensationEmployeeDto,
      },
      tokenPayload,
    );
  }
}
