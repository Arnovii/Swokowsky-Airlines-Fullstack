import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyHiloDto {
  
  @ApiProperty({
    example: '¡Excelente pregunta! La solución a ese problema es inicializar el módulo con el parámetro --force.',
    description: 'Contenido de la respuesta al hilo. Debe ser texto (string).',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 500) // Añadidos límites típicos para validar contenido
  contenido: string;
}