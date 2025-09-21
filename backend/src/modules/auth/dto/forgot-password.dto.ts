import { IsEmail } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";


export class ForgotPasswordDto {
    @ApiProperty({
    example: 'arnovi.jimenez1@gmail.com', 
    description: 'Correo electrónico del usuario registrado en la plataforma. Se utiliza para enviar un enlace con instrucciones para restablecer la contraseña.'
  })
  @IsEmail()
  email: string;
}
