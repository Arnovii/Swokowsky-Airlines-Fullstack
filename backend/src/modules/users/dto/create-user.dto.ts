import {
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  IsBoolean,
  Length,
} from 'class-validator';
import { TipoUsuario, GeneroUsuario } from '../enums/usuario.enums';

export class CreateUserDto {
  @IsEnum(TipoUsuario)
  tipo_usuario: TipoUsuario;

  @IsString()
  dni: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsString()
  lugar_nacimiento: string;

  @IsString()
  direccion_facturacion: string;

  @IsEnum(GeneroUsuario)
  genero: GeneroUsuario;

  @IsEmail()
  correo: string;

  @IsString()
  username: string;

  @IsString()
  @Length(8, 255)
  password_bash: string;

  @IsString()
  img_url: string;

  @IsBoolean()
  suscrito_noticias: boolean;
}
