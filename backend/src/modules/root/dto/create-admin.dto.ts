import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  correo: string;

  @MinLength(6)
  contrasena: string;
}
