import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { EmployeeGroupService } from './employee-group.service';
import { CreateEmployeeGroupDTO } from './dto/create-employee-group.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { BranchGuard } from 'guards/branch.guard';
import { FindManyDTO } from 'utils/Common.dto';

@Controller('employee-group')
export class EmployeeGroupController {
  constructor(private readonly employeeGroupService: EmployeeGroupService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, BranchGuard)
  create(
    @Body() createEmployeeGroupDto: CreateEmployeeGroupDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.create(
      createEmployeeGroupDto,
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(@Query() findManyDTO: FindManyDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.findAll(findManyDTO, tokenPayload);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.employeeGroupService.findUniq(
      {
        id: +id,
      },
      tokenPayload,
    );
  }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, BranchGuard)
  // update(
  //   @Param('id') id: string,
  //   @Body() createMeasurementUnitDto: CreateMeasurementUnitDTO,
  //   @Req() req: any,
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.employeeGroupService.update(
  //     {
  //       where: {
  //         id: +id,
  //       },
  //       data: createMeasurementUnitDto,
  //     },
  //     tokenPayload,
  //   );
  // }

  // @Delete('')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, BranchGuard)
  // deleteMany(
  //   @Param('id') id: string,
  //   @Body() deleteManyDto: DeleteManyDto,
  //   @Req() req: any,
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload;

  //   return this.employeeGroupService.removeMany(
  //     {
  //       id: {
  //         in: deleteManyDto.ids,
  //       },
  //     },
  //     tokenPayload,
  //   );
  // }
}
