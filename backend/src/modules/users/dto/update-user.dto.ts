import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

// Esto hace que todos los campos de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {

  @IsOptional()
  @IsString()
  direccion_facturacion?: string;

  @IsOptional()
  @IsBoolean()
  suscrito_noticias?: boolean;

  // 🚫 No incluyas tarjeta[] ni ticket[] aquí
  // Si necesitas gestionar tarjetas/tickets, crea DTOs y endpoints aparte.
}
