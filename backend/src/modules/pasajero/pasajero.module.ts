import { Module } from '@nestjs/common';
import { PasajeroController } from './pasajero.controller';
import { PasajeroService } from './pasajero.service';

@Module({
  controllers: [PasajeroController],
  providers: [PasajeroService],
  exports: [PasajeroService],
})
export class PasajeroModule {}
