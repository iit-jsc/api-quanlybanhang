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
import { MeasurementUnitService } from "./measurement-unit.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { CreateMeasurementUnitDto, UpdateMeasurementUnitDto } from "./dto/measurement-unit.dto";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { RolesGuard } from "guards/roles.guard";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";

@Controller("measurement-unit")
export class MeasurementUnitController {
  constructor(private readonly measurementUnitService: MeasurementUnitService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_MEASUREMENT_UNIT", SPECIAL_ROLE.MANAGER)
  create(@Body() createMeasurementUnitDto: CreateMeasurementUnitDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.create(createMeasurementUnitDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_MEASUREMENT_UNIT", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() UpdateMeasurementUnitDto: UpdateMeasurementUnitDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.update(
      {
        where: {
          id,
        },
        data: UpdateMeasurementUnitDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_MEASUREMENT_UNIT", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
