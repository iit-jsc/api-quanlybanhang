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
import { EmployeeSalaryService } from './employee-salary.service'
import { DeleteManyDto, FindManyDto, FindUniqDto } from 'utils/Common.dto'
import { TokenPayload } from 'interfaces/common.interface'
import {
  CreateEmployeeSalaryDto,
  FindManyEmployeeSalaryDto,
  UpdateEmployeeSalaryDto
} from './dto/employee-salary.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { FIND_UNIQ_TYPE, SPECIAL_ROLE } from 'enums/common.enum'
import { Roles } from 'guards/roles.decorator'

@Controller('employee-salary')
export class EmployeeSalaryController {
  constructor(private readonly employeeSalaryService: EmployeeSalaryService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_SALARY',
    'UPDATE_SALARY',
    'DELETE_SALARY',
    'VIEW_SALARY',
    SPECIAL_ROLE.MANAGER
  )
  create(
    @Body() createEmployeeSalaryDto: CreateEmployeeSalaryDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.employeeSalaryService.create(
      createEmployeeSalaryDto,
      tokenPayload
    )
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_SALARY',
    'UPDATE_SALARY',
    'DELETE_SALARY',
    'VIEW_SALARY',
    SPECIAL_ROLE.MANAGER
  )
  findAll(@Query() data: FindManyEmployeeSalaryDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.employeeSalaryService.findAll(data, tokenPayload)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_SALARY',
    'UPDATE_SALARY',
    'DELETE_SALARY',
    'VIEW_SALARY',
    SPECIAL_ROLE.MANAGER
  )
  findUniq(
    @Param('id') id: string,
    @Req() req: any,
    @Query() findUniqDto: FindUniqDto
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.employeeSalaryService.findUniq(
      findUniqDto.type === FIND_UNIQ_TYPE.ID ? { id } : { employeeId: id },
      tokenPayload
    )
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_SALARY', SPECIAL_ROLE.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateEmployeeSalaryDto: UpdateEmployeeSalaryDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.employeeSalaryService.update(
      {
        where: {
          id
        },
        data: updateEmployeeSalaryDto
      },
      tokenPayload
    )
  }
}
