import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Nombre del administrador',
    example: 'Juan',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Apellido del administrador',
    example: 'Pérez',
  })
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico del administrador',
    example: 'juan.perez@ejemplo.com',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    description: 'Nombre de usuario del administrador',
    example: 'juanperez',
  })
  @IsNotEmpty()
  @IsString()
  username: string;
}
