import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Req,
  UploadedFile,
  Param,
  Patch,
  Delete,
  Query,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateEmployeeDto } from './dto/create-employee-dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
import { CreateBranchDto } from 'src/branch/dto/create-branch.dto';
import { CustomFileInterceptor } from 'utils/Helps';
import { UpdateEmployeeDto } from './dto/update-employee-dto';
import { RolesGuard } from 'guards/roles.guard';
import { Roles } from 'guards/roles.decorator';
import { SPECIAL_ROLE } from 'enums/common.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_EMPLOYEE', SPECIAL_ROLE.MANAGER)
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.createEmployee(createEmployeeDto, tokenPayload);
  }

  @Get('/employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_EMPLOYEE',
    'UPDATE_EMPLOYEE',
    'DELETE_EMPLOYEE',
    'VIEW_EMPLOYEE',
    SPECIAL_ROLE.MANAGER,
  )
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.findAllEmployee(findManyDto, tokenPayload);
  }

  @Get('/employee/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_EMPLOYEE',
    'UPDATE_EMPLOYEE',
    'DELETE_EMPLOYEE',
    'VIEW_EMPLOYEE',
    SPECIAL_ROLE.MANAGER,
  )
  findUniqEmployee(@Param('id') id: number, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.findUniqEmployee(
      {
        id,
      },
      tokenPayload,
    );
  }

  @Patch('/employee/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_EMPLOYEE', SPECIAL_ROLE.MANAGER)
  updateEmployee(
    @Param('id') id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.updateEmployee(
      {
        where: {
          id,
        },
        data: updateEmployeeDto,
      },
      tokenPayload,
    );
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_EMPLOYEE', SPECIAL_ROLE.MANAGER)
  removeMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.userService.removeManyEmployee(
      {
        id: {
          in: deleteManyDto.ids,
        },
      },
      tokenPayload,
    );
  }
}
