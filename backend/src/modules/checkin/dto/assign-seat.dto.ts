import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class AssignSeatDto {
  @ApiProperty({ example: 'ABC123', description: 'Código de reserva' })
  @IsString()
  codigo_unico: string;

  @ApiProperty({ example: 123, description: 'ID del ticket' })
  @IsNumber()
  ticketId: number;

  @ApiProperty({ example: 'C14', description: 'Código del asiento (ej: A1, B5, C14, etc.)' })
  @IsString()
  asiento: string;
}
