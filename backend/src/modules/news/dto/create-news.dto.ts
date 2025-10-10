import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
  IsInt,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

class PromotionInput {
  @ApiProperty({ example: 'Promo Black November' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Descuento especial por apertura' })
  @IsString()
  descripcion: string;

  @ApiProperty({ example: 0.15, description: 'Formato decimal: 0.15 = 15%' })
  @IsNumber()
  @Min(0)
  descuento: number;

  @ApiProperty({ example: '2025-11-01T00:00:00', description: 'ISO 8601 date-time' })
  @IsISO8601()
  fecha_inicio: string;

  @ApiProperty({ example: '2025-11-30T23:59:59', description: 'ISO 8601 date-time' })
  @IsISO8601()
  fecha_fin: string;
}

export class CreateNewsDto {
  /* Datos de la noticia (rellenados manualmente por admin) */
  @ApiProperty({ example: 'Nuevo vuelo Bogotá → Barranquilla' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Paseos a la costa pa' })
  @IsString()
  @IsNotEmpty()
  descripcion_corta: string;

  @ApiProperty({ example: 'Detalles del servicio, frecuencias, servicios a bordo...' })
  @IsString()
  @IsNotEmpty()
  descripcion_larga: string;

  @ApiProperty({ example: 'https://images.pexels.com/photos/13808425/pexels-photo-13808425.jpeg' })
  @IsUrl()
  url_imagen: string;

  /* Precios (admin ingresa) */
  @ApiProperty({ example: 350000 })
  @IsNumber()
  @Min(0)
  precio_economica: number;

  @ApiProperty({ example: 1200000 })
  @IsNumber()
  @Min(0)
  precio_primera_clase: number;

  /* Promoción: puede venir o no; si viene, se crea */
  @ApiPropertyOptional({ type: PromotionInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionInput)
  promocion?: PromotionInput | null;

  /* Tiempos que ingresa el admin — EN HORA DE COLOMBIA (America/Bogota) */
  @ApiProperty({ example: '2025-11-05T09:00:00', description: 'ISO 8601 (hora de Colombia)' })
  @IsISO8601()
  salida_colombia: string;

  @ApiProperty({ example: '2025-11-05T13:30:00', description: 'ISO 8601 (hora de Colombia)' })
  @IsISO8601()
  llegada_colombia: string;

  /* Selectores que el admin obtiene desde listas existentes en DB (IDs) */
  @ApiProperty({ example: 2, description: 'ID de la aeronave (seleccionada desde lista)' })
  @IsInt()
  id_aeronaveFK: number;

  @ApiProperty({ example: 7, description: 'ID del aeropuerto de origen (seleccionado desde lista)' })
  @IsInt()
  id_aeropuerto_origenFK: number;

  @ApiProperty({ example: 18, description: 'ID del aeropuerto de destino (seleccionado desde lista)' })
  @IsInt()
  id_aeropuerto_destinoFK: number;
}
