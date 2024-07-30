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
import { TableSalaryService } from "./table-salary.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { CreateTableSalaryDto, UpdateTableSalaryDto } from "./dto/table-salary.dto";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";

@Controller("table-salary")
export class TableSalaryController {
  constructor(private readonly tableSalaryService: TableSalaryService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post("")
  create(@Body() createTableSalaryDto: CreateTableSalaryDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableSalaryService.create(createTableSalaryDto, tokenPayload);
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableSalaryService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableSalaryService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch(":id/confirm")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  confirm(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableSalaryService.confirm(
      {
        where: {
          id,
        },
      },
      tokenPayload,
    );
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() updateTableSalaryDto: UpdateTableSalaryDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableSalaryService.update(
      {
        where: {
          id,
        },
        data: updateTableSalaryDto,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.tableSalaryService.deleteMany(deleteManyDto, tokenPayload);
  }
}
