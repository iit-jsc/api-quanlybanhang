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
import { EmployeeScheduleService } from "./employee-schedule.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { RegisterScheduleDto, UpdateRegisterScheduleDto } from "./dto/employee.schedule.dto";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Controller("employee-schedule")
export class EmployeeScheduleController {
  constructor(private readonly employeeScheduleService: EmployeeScheduleService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(@Body() registerScheduleDto: RegisterScheduleDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeScheduleService.registerSchedule(registerScheduleDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeScheduleService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeScheduleService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() updateRegisterScheduleDto: UpdateRegisterScheduleDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeScheduleService.update(
      {
        where: {
          id,
        },
        data: updateRegisterScheduleDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeScheduleService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
