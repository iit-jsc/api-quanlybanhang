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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { TableService } from "./table.service";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { CustomFileInterceptor } from "utils/Helps";
import { TokenPayload } from "interfaces/common.interface";
import { DeleteManyDto, FindManyDto } from "utils/Common.dto";
import { CreateTableDto, UpdateTableDto } from "./dto/table.dto";
import { Roles } from "guards/roles.decorator";
import { SPECIAL_ROLE } from "enums/common.enum";
import { RolesGuard } from "guards/roles.guard";

@Controller("table")
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_TABLE", SPECIAL_ROLE.MANAGER)
  create(
    @Body() createTableDto: CreateTableDto,

    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableService.create(createTableDto, tokenPayload);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("UPDATE_TABLE", SPECIAL_ROLE.MANAGER)
  update(@Param("id") id: string, @Body() updateTableDto: UpdateTableDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableService.update(
      {
        where: {
          id,
        },
        data: updateTableDto,
      },
      tokenPayload,
    );
  }

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_TABLE", "UPDATE_TABLE", "DELETE_TABLE", "VIEW_TABLE", SPECIAL_ROLE.MANAGER)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableService.findAll(findManyDto, tokenPayload);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CREATE_TABLE", "UPDATE_TABLE", "DELETE_TABLE", "VIEW_TABLE", SPECIAL_ROLE.MANAGER)
  findUniq(@Param("id") id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.tableService.findUniq(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Delete("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DELETE_TABLE", SPECIAL_ROLE.MANAGER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.tableService.deleteMany(
      {
        ids: deleteManyDto.ids,
      },
      tokenPayload,
    );
  }
}
