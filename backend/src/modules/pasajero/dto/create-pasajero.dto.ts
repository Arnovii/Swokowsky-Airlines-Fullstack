import { IsString, IsDateString, IsEnum } from 'class-validator';

export enum GeneroPasajero {
  M = 'M',
  F = 'F',
  X = 'X',
}

export class CreatePasajeroDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  dni: string;

  @IsEnum(GeneroPasajero)
  genero: GeneroPasajero;

  @IsDateString()
  fecha_nacimiento: string;
}
