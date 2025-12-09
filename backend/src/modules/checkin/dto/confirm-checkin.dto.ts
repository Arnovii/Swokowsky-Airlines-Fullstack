import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class ConfirmCheckinDto {
  @ApiProperty({ example: 'ABC123', description: 'Código de reserva' })
  @IsString()
  codigo_unico: string;

  @ApiProperty({ example: 123, description: 'ID del ticket' })
  @IsNumber()
  ticketId: number;
}
