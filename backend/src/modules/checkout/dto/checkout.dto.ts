import { IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePasajeroDto } from '../../pasajero/dto/create-pasajero.dto';

export class CheckoutDto {
  @IsNumber()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePasajeroDto)
  pasajeros: CreatePasajeroDto[];

  // Puedes agregar más campos si el frontend los envía (ej: idVuelo, clase, etc)
}
