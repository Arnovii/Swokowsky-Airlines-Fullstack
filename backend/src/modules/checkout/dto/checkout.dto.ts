// checkout.dto.ts
import { IsArray, IsDateString, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para cada pasajero enviado desde frontend
 */
export class PasajeroDto {
  @IsString() @IsNotEmpty()
  nombre: string;

  @IsString() @IsNotEmpty()
  apellido: string;

  @IsString() @IsNotEmpty()
  dni: string;

  @IsString() @IsNotEmpty()
  phone: string; // no aplico IsPhoneNumber para permitir formatos variados

  @IsString() @IsNotEmpty()
  email: string;

  // campos opcionales de contacto
  @IsOptional() @IsString()
  contact_name?: string | null;

  @IsOptional() @IsString()
  phone_name?: string | null;

  @IsIn(['M', 'F', 'X'])
  genero: 'M' | 'F' | 'X';

  @IsDateString()
  fecha_nacimiento: string; // ISO date string (ej: '1990-05-14')
}

/**
 * DTO por cada item del carrito (item1, item2, ...)
 */
export class CheckoutItemDto {
  @IsInt()
  vueloID: number;

  // Debe coincidir con el enum asiento_clases: 'economica' | 'primera_clase'
  @IsString()
  @IsIn(['economica', 'primera_clase'])
  Clase: 'economica' | 'primera_clase';

  @IsInt()
  CantidadDePasajeros: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PasajeroDto)
  pasajeros: PasajeroDto[];
}

/**
 * CheckoutDto global: llave dinámica: item1, item2, ...
 * En Nest puedes declarar el DTO del controlador como:
 *  @Body() checkoutDto: Record<string, CheckoutItemDto>
 *
 * Aquí se exporta el tipo y una clase auxiliar para validaciones más avanzadas
 */
export type CheckoutDto = Record<string, CheckoutItemDto>;
