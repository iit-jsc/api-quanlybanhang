import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CompensationEmployeeService } from "./compensation-employee.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { CreateCompensationEmployeeDto, UpdateCompensationEmployeeDto } from "./dto/compensation-employee.dto";
import { FindManyDto } from "utils/Common.dto";

@Controller("compensation-employee")
export class CompensationEmployeeController {
  constructor(private readonly compensationEmployeeService: CompensationEmployeeService) {}

  // @Post("")
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // create(@Body() createCompensationEmployeeDto: CreateCompensationEmployeeDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.compensationEmployeeService.create(createCompensationEmployeeDto, tokenPayload);
  // }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.compensationEmployeeService.findAll(findManyDto, tokenPayload);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  // @Roles("UPDATE_EMPLOYEE_GROUP", SPECIAL_ROLE.MANAGER)
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
