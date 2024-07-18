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
import { CreateWorkShiftDto, UpdateWorkShiftDto } from "./dto/work-shift.dto";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Controller("work-shift")
export class WorkShiftController {
  constructor(private readonly workShiftService: WorkShiftService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(@Body() createWorkShiftDto: CreateWorkShiftDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.workShiftService.create(createWorkShiftDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.workShiftService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
