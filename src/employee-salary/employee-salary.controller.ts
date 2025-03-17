import { Controller } from '@nestjs/common'
import { EmployeeSalaryService } from './employee-salary.service'

@Controller('employee-salary')
export class EmployeeSalaryController {
  constructor(private readonly employeeSalaryService: EmployeeSalaryService) {}

  // @Post('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SALARY',
  //   'UPDATE_SALARY',
  //   'DELETE_SALARY',
  //   'VIEW_SALARY',
  //   SPECIAL_ROLE.MANAGER
  // )
  // create(
  //   @Body() createEmployeeSalaryDto: CreateEmployeeSalaryDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeSalaryService.create(
  //     createEmployeeSalaryDto,
  //     tokenPayload
  //   )
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SALARY',
  //   'UPDATE_SALARY',
  //   'DELETE_SALARY',
  //   'VIEW_SALARY',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findAll(@Query() data: FindManyEmployeeSalaryDto, @Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeSalaryService.findAll(data, tokenPayload)
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(
  //   'CREATE_SALARY',
  //   'UPDATE_SALARY',
  //   'DELETE_SALARY',
  //   'VIEW_SALARY',
  //   SPECIAL_ROLE.MANAGER
  // )
  // findUniq(
  //   @Param('id') id: string,
  //   @Req() req: any,
  //   @Query() findUniqDto: FindUniqDto
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeSalaryService.findUniq(
  //     findUniqDto.type === FIND_UNIQ_TYPE.ID ? { id } : { employeeId: id },
  //     tokenPayload
  //   )
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('UPDATE_SALARY', SPECIAL_ROLE.MANAGER)
  // update(
  //   @Param('id') id: string,
  //   @Body() updateEmployeeSalaryDto: UpdateEmployeeSalaryDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.employeeSalaryService.update(
  //     {
  //       where: {
  //         id
  //       },
  //       data: updateEmployeeSalaryDto
  //     },
  //     tokenPayload
  //   )
  // }
}
