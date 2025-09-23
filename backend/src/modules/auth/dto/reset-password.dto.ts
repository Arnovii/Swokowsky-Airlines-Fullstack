import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";


export class ResetPasswordDto {
    @ApiProperty({ example: 'eyJhb...', description: 'Token que es enviado al correo de la persona (se encuentra en el queryParameter de la URL)' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        example: '12345678', description: 'La nueva contraseña que el usuario desea establecer', minLength: 8, maxLength: 255

    })
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @Length(8, 255)
    newPassword: string;
}
