import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { usuario_tipo_usuario } from '@prisma/client';

// Esto hace que todos los campos de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {

  @IsOptional()
  @IsString()
  direccion_facturacion?: string;

  @IsOptional()
  @IsBoolean()
  suscrito_noticias?: boolean;

  @IsEnum(usuario_tipo_usuario)
  tipo_usuario?: usuario_tipo_usuario;

  // 🚫 No incluyas tarjeta[] ni ticket[] aquí (Todo lo que sea una llave foranea)
  // Si necesitas gestionar tarjetas/tickets, crea DTOs y endpoints aparte.
}
