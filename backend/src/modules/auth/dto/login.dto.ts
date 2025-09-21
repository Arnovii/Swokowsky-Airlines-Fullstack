import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Length } from "class-validator";


export class LoginDto {
    @ApiProperty({ example: 'test@live.com', description: 'Correo del usuario' })
    @IsEmail()
    correo: string;

    @ApiProperty({ example: '12345678', description: 'Contraseña del usuario' })
    @Transform(({ value }) => value.trim())
    @IsString()
    @Length(8, 255)
    password_bash: string;
}
