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
import { WorkShiftService } from "./work-shift.service";
import { CreateWorkShiftDto, FindManyWorkShiftDto, UpdateWorkShiftDto } from "./dto/work-shift.dto";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto } from "utils/Common.dto";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";
import { RolesGuard } from "guards/roles.guard";

@Controller("work-shift")
export class WorkShiftController {
  constructor(private readonly workShiftService: WorkShiftService) {}

  @Post("")
  @Roles("CREATE_WORK_SHIFT", SPECIAL_ROLE.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createWorkShiftDto: CreateWorkShiftDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.workShiftService.create(createWorkShiftDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_WORK_SHIFT", "UPDATE_WORK_SHIFT", "DELETE_WORK_SHIFT", "VIEW_WORK_SHIFT", SPECIAL_ROLE.MANAGER)
  findAll(@Query() data: FindManyWorkShiftDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.workShiftService.findAll(data, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_WORK_SHIFT", "UPDATE_WORK_SHIFT", "DELETE_WORK_SHIFT", "VIEW_WORK_SHIFT", SPECIAL_ROLE.MANAGER)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.workShiftService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_WORK_SHIFT", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() updateWorkShiftDto: UpdateWorkShiftDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.workShiftService.update(
      {
        where: {
          id,
        },
        data: updateWorkShiftDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_WORK_SHIFT", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.workShiftService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
