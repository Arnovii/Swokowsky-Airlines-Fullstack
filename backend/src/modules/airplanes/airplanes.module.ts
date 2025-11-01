import { Module } from '@nestjs/common';
import { AirplanesService } from './airplanes.service';
import { AirplanesController } from './airplanes.controller';

@Module({
  controllers: [AirplanesController],
  providers: [AirplanesService],
})
export class AirplanesModule {}
