import {
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  Length,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { tarjeta_tipo } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';


/**
 * DTO para crear una nueva tarjeta
 */
export class CreateCardDto {

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del titular de la tarjeta.',
  })
  @IsString()
  @Length(5, 255)
  titular: string;

  @ApiProperty({
    example: 12,
    description: 'Mes de vencimiento de la tarjeta (1-12).',
  })
  @IsInt()
  @Min(1)
  @Max(12)
  vence_mes: number;

  @ApiProperty({
    example: 2028,
    description: 'Año de vencimiento de la tarjeta.',
  })
  @IsInt()
  @Min(new Date().getFullYear())
  vence_anio: number;

  @ApiProperty({
    example: '123',
    description: 'Código de seguridad cifrado o encriptado.',
  })
  @IsString()
  @Length(3, 4)
  cvv_ene: string;

  @ApiProperty({
    enum: tarjeta_tipo,
    example: 'credito',
    description: 'Tipo de tarjeta (crédito o débito).',
  })
  @IsEnum(tarjeta_tipo)
  tipo: tarjeta_tipo;

  @ApiProperty({
    example: 'Banco de Bogotá',
    description: 'Nombre del banco emisor.',
  })
  @IsString()
  @Length(2, 255)
  banco: string;

  @ApiProperty({
    example: '2025-10-31T10:00:00.000Z',
    description: 'Fecha de creación del registro.',
  })
  @IsDateString()
  creado_en: Date;

  @ApiProperty({
    example: "1234567890123456",
    description: 'numero de tarjeta único.',
  })
  @IsNotEmpty()
  @IsString()
  @Length(16, 16)
  num_tarjeta: string; 
}
