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
  UseGuards
} from '@nestjs/common'
import { TableSalaryService } from './table-salary.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import {
  CreateTableSalaryDto,
  UpdateTableSalaryDto
} from './dto/table-salary.dto'
import { TokenPayload } from 'interfaces/common.interface'
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto'
import { SPECIAL_ROLE } from 'enums/common.enum'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'

@Controller('table-salary')
export class TableSalaryController {
  constructor(private readonly tableSalaryService: TableSalaryService) {}

  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("CREATE_SALARY", SPECIAL_ROLE.MANAGER)
  // @Post("")
  // create(@Body() createTableSalaryDto: CreateTableSalaryDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.tableSalaryService.create(createTableSalaryDto, tokenPayload);
  // }

  // @Get("")
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("CREATE_SALARY", "UPDATE_SALARY", "DELETE_SALARY", "VIEW_SALARY", SPECIAL_ROLE.MANAGER)
  // findAll(@Query() data: FindManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.tableSalaryService.findAll(data, tokenPayload);
  // }

  // @Get(":id")
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("CREATE_SALARY", "UPDATE_SALARY", "DELETE_SALARY", "VIEW_SALARY", SPECIAL_ROLE.MANAGER)
  // findUniq(@Param("id") id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.tableSalaryService.findUniq(
  //     {
  //       id,
  //     },
  //     tokenPayload,
  //   );
  // }

  // @Patch(":id/confirm")
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("CONFIRM_SALARY", SPECIAL_ROLE.MANAGER)
  // confirm(@Param("id") id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.tableSalaryService.confirm(
  //     {
  //       where: {
  //         id,
  //       },
  //     },
  //     tokenPayload,
  //   );
  // }

  // @Patch(":id")
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("UPDATE_SALARY", SPECIAL_ROLE.MANAGER)
  // update(@Param("id") id: string, @Body() updateTableSalaryDto: UpdateTableSalaryDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.tableSalaryService.update(
  //     {
  //       where: {
  //         id,
  //       },
  //       data: updateTableSalaryDto,
  //     },
  //     tokenPayload,
  //   );
  // }

  // @Delete("")
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("DELETE_SALARY", SPECIAL_ROLE.MANAGER)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;
  //   return this.tableSalaryService.deleteMany(deleteManyDto, tokenPayload);
  // }
}
