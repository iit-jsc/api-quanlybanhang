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
import { EmployeeScheduleService } from './employee-schedule.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import {
  FindManyEmployeeScheduleDto,
  RegisterScheduleDto,
  UpdateRegisterScheduleDto
} from './dto/employee.schedule.dto'
import { TokenPayload } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import { Roles } from 'guards/roles.decorator'
import { RolesGuard } from 'guards/roles.guard'
import { SPECIAL_ROLE } from 'enums/common.enum'

@Controller('employee-schedule')
export class EmployeeScheduleController {
  constructor(
    private readonly employeeScheduleService: EmployeeScheduleService
  ) {}

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @Roles('CREATE_EMPLOYEE_SCHEDULE', SPECIAL_ROLE.MANAGER)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // create(@Body() registerScheduleDto: RegisterScheduleDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeScheduleService.registerSchedule(
  //     registerScheduleDto,
  //     tokenPayload
  //   )
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_EMPLOYEE_SCHEDULE',
  //   'UPDATE_EMPLOYEE_SCHEDULE',
  //   'DELETE_EMPLOYEE_SCHEDULE',
  //   'VIEW_EMPLOYEE_SCHEDULE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManyEmployeeScheduleDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeScheduleService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_EMPLOYEE_SCHEDULE',
  //   'UPDATE_EMPLOYEE_SCHEDULE',
  //   'DELETE_EMPLOYEE_SCHEDULE',
  //   'VIEW_EMPLOYEE_SCHEDULE',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(@Param('id') id: string, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeScheduleService.findUniq(
  //     {
  //       id
  //     },
  //     tokenPayload
  //   )
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @Roles('UPDATE_EMPLOYEE_SCHEDULE', SPECIAL_ROLE.MANAGER)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateRegisterScheduleDto: UpdateRegisterScheduleDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeScheduleService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateRegisterScheduleDto
  //     },
  //     tokenPayload
  //   )
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @Roles('DELETE_EMPLOYEE_SCHEDULE', SPECIAL_ROLE.MANAGER)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeScheduleService.deleteMany(
  //     {
  //       ids: deleteManyDto.ids
  //     },
  //     tokenPayload
  //   )
  // }
}
