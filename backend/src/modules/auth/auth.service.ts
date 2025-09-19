import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import type { PayloadInterface } from './dto/payload.dto';


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async register(data: RegisterDto) {
        try {
            //verifications
            const userByEmail = await this.userService.findUserByEmail(data.correo)
            if (userByEmail) throw new BadRequestException("Este correo ya se ha utilizado")

            const userByUsername = await this.userService.findUserByUsername(data.username)
            if (userByUsername) throw new BadRequestException("Este username ya se ha utilizado")

            //hashing password
            data.password_bash = await bcryptjs.hash(data.password_bash, 10)

            //creating user
            return await this.userService.createUser(data)

        } catch (error) { return new BadRequestException(`El usuario no se ha podido registrar. ${error}`) }
    }

    async login(data: LoginDto) {
        //verificar correo
        const userByEmail = await this.userService.findUserByEmail(data.correo)
        if (!userByEmail) throw new UnauthorizedException(`No existe cuenta asociada al correo ${data.correo}`)
        //verificar contraseña
        const isPasswordValid = await bcryptjs.compare(data.password_bash, userByEmail.password_bash);
        if (!isPasswordValid) throw new UnauthorizedException(`Contraseña incorrecta`)

        //retornar JWT
        //Paylaod: ¿Que datos NO SENSIBLES van a a viajar en el token? 
        const payload: PayloadInterface = { 
            email: userByEmail.correo, 
            username: userByEmail.username, 
            tipo_usuario: userByEmail.tipo_usuario 
        };
        const token = await this.jwtService.signAsync(payload)
        return {
            token: token,
            username: userByEmail.username,
            email: userByEmail.correo,
            tipo_usuario: userByEmail.tipo_usuario
        }
    }




}
