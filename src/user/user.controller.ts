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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.createEmployee(createEmployeeDto, tokenPayload);
  }

  @Get('/employee')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.userService.findAllEmployee(findManyDto, tokenPayload);
  }

  @Get('/employee/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
