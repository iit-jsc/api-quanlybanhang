import { Module } from '@nestjs/common';
import { MeasurementUnitService } from './measurement-unit.service';
import { MeasurementUnitController } from './measurement-unit.controller';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [MeasurementUnitService],
  controllers: [MeasurementUnitController],
})
export class MeasurementUnitModule {}
