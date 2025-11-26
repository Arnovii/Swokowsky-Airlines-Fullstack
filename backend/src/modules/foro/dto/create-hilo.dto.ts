import { IsString, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Definición de las categorías disponibles
export enum ForoCategoria {
  queja = 'queja',
  duda = 'duda',
  recomendacion = 'recomendacion',
  halago = 'halago',
}

export class CreateHiloDto {
  @ApiProperty({
    example: 'Duda sobre la funcionalidad de pago',
    description: 'Título descriptivo del nuevo hilo.',
    minLength: 10,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 100)
  titulo: string;

  @ApiProperty({
    example:
      'Al intentar realizar un pago con tarjeta, la aplicación se cierra inesperadamente. ¿Podrían revisarlo?',
    description: 'Contenido detallado o cuerpo del mensaje del hilo.',
    minLength: 20,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(20, 1000)
  contenido: string;

  @ApiProperty({
    enum: ForoCategoria,
    example: ForoCategoria.duda,
    description:
      'Categoría del hilo. Debe ser uno de los valores definidos: queja, duda, recomendacion, halago.',
  })
  @IsEnum(ForoCategoria)
  @IsNotEmpty()
  categoria: ForoCategoria;
}
