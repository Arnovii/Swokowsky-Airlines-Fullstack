import { IsInt, Min, Max, IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { asiento_clases } from '@prisma/client';

/**
 * DTO para agregar un item al carrito
 */
export class AddCartItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID del vuelo al que se desea agregar el item (FK).',
  })
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id_vueloFK: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad de tickets a reservar para este item (entero). Mínimo 1, máximo 5.',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  cantidad_de_tickets: number;

  @ApiProperty({
    enum: asiento_clases,
    example: 'economica',
    description: 'Clase de asiento para la reserva. Debe ser uno de los valores permitidos por el enum `asiento_clases`.',
  })
  @IsEnum(asiento_clases)
  @IsNotEmpty()
  clase: asiento_clases;
}
