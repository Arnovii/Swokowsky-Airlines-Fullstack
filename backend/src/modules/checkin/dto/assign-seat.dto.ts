import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignSeatDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6', description: 'Código único de check-in' })
  @IsString()
  codigo_unico: string;

  @ApiProperty({ example: 'E-12', description: 'Código del asiento (ej: E-1, P-1, etc.)' })
  @IsString()
  asiento: string;
}
