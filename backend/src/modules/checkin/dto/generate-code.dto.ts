import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GenerateCodeDto {
  @ApiProperty({ example: 123, description: 'Id del ticket' })
  @IsInt()
  ticketId: number;
}
