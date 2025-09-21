import {
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  Length,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import {nationalities, usuario_genero} from '@prisma/client';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/*Es el mismo DTO que create-user.dto.ts*/
export class RegisterDto{
  @ApiProperty({
    example: '123456789',
    description: 'Documento de identidad del usuario (8 a 20 caracteres)',
    minLength: 8,
    maxLength: 20,
  })
  @Length(8, 20)
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    example: '2003-01-20T04:06:28.975Z',
    description: 'Fecha de nacimiento en formato ISO-8601 DateTime',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: string;

  @ApiProperty({
    enum: nationalities,
    example: 'Colombia',
    description: 'Nacionalidad, debe ser uno de los valores permitidos',
  })
  @IsNotEmpty()
  @IsEnum(nationalities)
  nacionalidad: nationalities;

  @ApiProperty({
    enum: usuario_genero,
    example: 'M',
    description: 'Género del usuario, debe ser uno de los valores permitidos (M-F-X)',
  })
  @IsNotEmpty()
  @IsEnum(usuario_genero)
  genero: usuario_genero;

  @ApiProperty({
    example: 'correo@ejemplo.com',
    description: 'Correo electrónico válido y único',
  })
  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'juanito20',
    description: 'Nombre de usuario (mínimo 5, máximo 20 caracteres)',
    minLength: 5,
    maxLength: 20,
  })
  @IsNotEmpty()
  @Length(5, 20)
  @Transform(({value}) => value.trim())
  @IsString()
  username: string;

  @ApiProperty({
    example: 'P@ssword123',
    description: 'Contraseña (mínimo 8 caracteres, es encriptada en el backend)',
    minLength: 8,
    maxLength: 255,
  })
  @Transform(({value}) => value.trim())
  @IsString()
  @Length(8, 255)
  password_bash: string;

  @ApiProperty({
    example: 'https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/025.png',
    description: 'URL de la imagen de perfil (obligatorio)',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  img_url: string;
}