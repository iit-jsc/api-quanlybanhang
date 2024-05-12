import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
    @Body() createMeasurementUnit: CreateMeasurementUnitDTO,
    @Req() req: any,
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.measurementUnitService.create(
      createMeasurementUnit,
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
}
