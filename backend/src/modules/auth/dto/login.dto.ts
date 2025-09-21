import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";


export class LoginDto {
    @ApiProperty({ example: 'test@live.com', description: 'Correo del usuario' })
    @IsNotEmpty()
    @IsEmail()
    correo: string;

    @ApiProperty({ example: '12345678', description: 'Contraseña del usuario', minLength: 8})
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @Length(8, 255)
    password_bash: string;
}
