import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmCheckinDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6', description: 'Código único de check-in' })
  @IsString()
  codigo_unico: string;
}
