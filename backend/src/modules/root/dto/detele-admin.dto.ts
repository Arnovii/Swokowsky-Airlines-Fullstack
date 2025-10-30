import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAdminDto {

  @ApiProperty({
    description: 'Correo electrónico del administrador ha ser eliminado',
    example: 'juan.perez@ejemplo.com',
  })
  @IsEmail()
  correo: string;
}
