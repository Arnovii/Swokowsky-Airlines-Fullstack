import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateCheckinDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6', description: 'Código único de check-in' })
  @IsString()
  codigo_unico: string;

  @ApiProperty({ example: '12345678', description: 'DNI del pasajero' })
  @IsString()
  dni: string;
}
