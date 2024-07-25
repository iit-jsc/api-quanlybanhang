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
import { CompensationSettingService } from "./compensation-setting.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { CreateCompensationSettingDto, UpdateCompensationSettingDto } from "./dto/compensation-setting.dto";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Controller("compensation-setting")
export class CompensationSettingController {
  constructor(private readonly compensationSettingService: CompensationSettingService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  // @Roles("CREATE_EMPLOYEE_GROUP", SPECIAL_ROLE.MANAGER)
  create(@Body() createCompensationSettingDto: CreateCompensationSettingDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.compensationSettingService.create(createCompensationSettingDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  // @Roles(
  //   "CREATE_EMPLOYEE_GROUP",
  //   "UPDATE_EMPLOYEE_GROUP",
  //   "DELETE_EMPLOYEE_GROUP",
  //   "VIEW_EMPLOYEE_GROUP",
  //   SPECIAL_ROLE.MANAGER,
  // )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.compensationSettingService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  // @Roles(
  //   "CREATE_EMPLOYEE_GROUP",
  //   "UPDATE_EMPLOYEE_GROUP",
  //   "DELETE_EMPLOYEE_GROUP",
  //   "VIEW_EMPLOYEE_GROUP",
  //   SPECIAL_ROLE.MANAGER,
  // )
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.compensationSettingService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  // @Roles("DELETE_EMPLOYEE_GROUP", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.compensationSettingService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
