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
} from '@nestjs/common';
import { MeasurementUnitService } from './measurement-unit.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { FindMeasurementUnitDTO } from './dto/find-measurement-unit.dto';
import { CreateMeasurementUnitDTO } from './dto/create-measurement-unit.dto';

@Controller('measurement-unit')
export class MeasurementUnitController {
  constructor(
    private readonly measurementUnitService: MeasurementUnitService,
  ) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createMeasurementUnitDto: CreateMeasurementUnitDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.create(
      createMeasurementUnitDto,
      tokenPayload,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() findMeasurementUnitDTO: FindMeasurementUnitDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.findAll(
      findMeasurementUnitDTO,
      tokenPayload,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findUniq(@Param('id') id: string, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.findUniq(
      {
        id: +id,
      },
      tokenPayload,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() createMeasurementUnitDto: CreateMeasurementUnitDTO,
  ) {
    return this.measurementUnitService.update({
      where: {
        id: +id,
      },
      data: createMeasurementUnitDto,
    });
  }
}
