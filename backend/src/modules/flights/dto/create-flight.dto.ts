import { vuelo_estado } from '@prisma/client';

export class CreateFlightDto {
  id_aeronaveFK: number;
  id_aeropuerto_origenFK: number;
  id_aeropuerto_destinoFK: number;
  salida_programada: Date;
  llegada_programada: Date;
  salida_programada_utc: Date;
  llegada_programada_utc: Date;
  estado?: vuelo_estado;
}
