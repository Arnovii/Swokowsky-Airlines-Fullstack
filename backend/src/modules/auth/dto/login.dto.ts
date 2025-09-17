import { Transform } from "class-transformer";
import { IsEmail, IsString, Length } from "class-validator";


export class LoginDto {
    @IsEmail()
    correo: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @Length(8, 255)
    password_bash: string;
}
