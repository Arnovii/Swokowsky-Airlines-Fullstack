import {
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  Length,
} from 'class-validator';
import {nationalities, usuario_genero} from '@prisma/client';
import { Transform } from 'class-transformer';

/*Es el mismo DTO que create-user.dto.ts*/
export class RegisterDto{
  @IsString()
  dni: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsEnum(nationalities)
  nacionalidad: nationalities;

  @IsEnum(usuario_genero)
  genero: usuario_genero;

  @IsEmail()
  correo: string;

  @Transform(({value}) => value.trim())
  @IsString()
  username: string;

  @Transform(({value}) => value.trim())
  @IsString()
  @Length(8, 255)
  password_bash: string;

  @IsString()
  img_url: string;
}