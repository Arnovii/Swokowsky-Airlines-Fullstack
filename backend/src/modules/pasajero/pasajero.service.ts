import { Injectable } from '@nestjs/common';
import { CreatePasajeroDto } from './dto/create-pasajero.dto';

@Injectable()
export class PasajeroService {
  processPasajero(createPasajeroDto: CreatePasajeroDto) {
    // Aquí podrías hacer validaciones adicionales o lógica temporal
    return {
      message: 'Datos de pasajero recibidos correctamente',
      pasajero: createPasajeroDto,
    };
  }
}
