import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMensajeDto {
  @ApiProperty({
    description: 'Contenido del mensaje',
    example: 'Gracias por contactarnos, ya revisamos su caso...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  contenido: string;
}
