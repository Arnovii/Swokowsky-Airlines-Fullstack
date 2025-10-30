import { IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar la cantidad de tickets de un item del carrito
 * (se usa el id del item en la ruta: PATCH /cart/items/:id)
 */
export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'Nueva cantidad de tickets para el item del carrito (1..5).',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => Number(value))
  cantidad_de_tickets: number;
}
