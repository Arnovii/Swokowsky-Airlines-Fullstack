// import { UpdateUserDto } from "../../users/dto/update-user.dto";
// import { PartialType } from '@nestjs/mapped-types';

// export class UpdateProfileDto extends PartialType(UpdateUserDto) {}
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  Length,
  IsNotEmpty,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { nationalities, usuario_genero, usuario_tipo_usuario } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    example: '123456789',
    description: 'Documento de identidad (8 a 20 caracteres)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  dni?: number;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apellido?: string;

  @ApiProperty({
    example: '2003-01-20T04:06:28.975Z',
    description: 'Fecha de nacimiento en formato ISO-8601 DateTime',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento?: string;

  @ApiProperty({
    enum: nationalities,
    example: 'Colombia',
    description: 'Nacionalidad (debe ser uno de los valores permitidos)',
    required: false,
  })
  @IsOptional()
  @IsEnum(nationalities)
  @IsNotEmpty()
  nacionalidad?: nationalities;

  @ApiProperty({
    enum: usuario_genero,
    example: 'MASCULINO',
    description: 'Género (debe ser uno de los valores permitidos)',
    required: false,
  })
  @IsOptional()
  @IsEnum(usuario_genero)
  @IsNotEmpty()
  genero?: usuario_genero;

  @ApiProperty({
    example: 'juanito20',
    description: 'Nombre de usuario (mínimo 5, máximo 20 caracteres)',
    required: false,
    minLength: 5,
    maxLength: 20,
  })
  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    example: '12345678',
    description: 'Nueva contraseña (mínimo 8 caracteres).',
    required: false,
    minLength: 8,
    maxLength: 255,
  })
  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(8, 255)
  @IsNotEmpty()
  password_bash?: string;

  @ApiProperty({
    example: 'https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/025.png',
    description: 'URL de la imagen de perfil',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  img_url?: string;

  @ApiProperty({
    example: 'Calle 123 #45-67',
    description: 'Dirección de facturación',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  direccion_facturacion?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario está suscrito a las noticias',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  suscrito_noticias?: boolean;

  @ApiProperty({
    enum: usuario_tipo_usuario,
    example: 'CLIENTE',
    description: 'Tipo de usuario (CLIENTE, ADMIN, ROOT)',
    required: false,
  })
  @IsOptional()
  @IsEnum(usuario_tipo_usuario)
  @IsNotEmpty()
  tipo_usuario?: usuario_tipo_usuario;
}
