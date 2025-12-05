import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversacionDto {
  @ApiProperty({
    description: 'Asunto de la conversación',
    example: 'Problema con mi reserva',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  asunto: string;

  @ApiProperty({
    description: 'Mensaje inicial de la conversación',
    example: 'Hola, tengo un problema con mi reserva del vuelo #123...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  mensaje: string;
}
