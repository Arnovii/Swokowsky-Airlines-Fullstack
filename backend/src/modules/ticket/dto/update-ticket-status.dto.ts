import { IsEnum } from 'class-validator';
import { ticket_estado } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketStatusDto {
  @ApiProperty({
    description: 'Estado nuevo del ticket',
    example: ticket_estado.cancelado,
    enum: ticket_estado,
  })
  @IsEnum(ticket_estado, { message: 'Estado inválido' })
  estado: ticket_estado;
}
