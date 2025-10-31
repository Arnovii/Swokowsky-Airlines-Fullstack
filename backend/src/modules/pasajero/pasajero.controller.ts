import { Body, Controller, Post } from '@nestjs/common';
import { PasajeroService } from './pasajero.service';
import { CreatePasajeroDto } from './dto/create-pasajero.dto';

@Controller('pasajero')
export class PasajeroController {
  constructor(private readonly pasajeroService: PasajeroService) {}

  @Post()
  create(@Body() createPasajeroDto: CreatePasajeroDto) {
    // Aquí solo validamos y devolvemos la data, no se guarda en la base de datos
    return this.pasajeroService.processPasajero(createPasajeroDto);
  }
}
