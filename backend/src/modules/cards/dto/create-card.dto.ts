import {
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  Length,
  IsDateString,
} from 'class-validator';
import { tarjeta_tipo } from '@prisma/client';

export class CreateCardDto {
  @IsInt()
  id_usuarioFK: number;

  @IsNumber()
  saldo: number;

  @IsString()
  @Length(5, 255)
  titular: string;

  @IsInt()
  @Min(1)
  @Max(12)
  vence_mes: number;

  @IsInt()
  @Min(new Date().getFullYear()) // evita fechas de vencimiento pasadas
  vence_anio: number;

  @IsEnum(tarjeta_tipo)
  tipo: tarjeta_tipo;

  @IsString()
  @Length(3, 4) // CVV comúnmente 3 o 4 dígitos
  cvv_ene: string;

  @IsString()
  @Length(2, 255)
  banco: string;

  @IsDateString()
  creado_en: Date;
}

