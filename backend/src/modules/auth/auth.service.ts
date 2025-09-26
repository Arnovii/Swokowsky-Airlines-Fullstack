import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import type { PayloadInterface } from '../../common/interfaces/payload.interface';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService // <-- para leer variables de entorno
    ) { }

    async register(data: RegisterDto) {
        try {
            //verifications
            const userByEmail = await this.userService.findUserByEmail(data.correo)
            if (userByEmail) throw new BadRequestException("Ya existe un usuario con ese correo.")

            const userByUsername = await this.userService.findUserByUsername(data.username)
            if (userByUsername) throw new BadRequestException("Ya existe un usuario con ese username.")

            //hashing password
            data.password_bash = await bcryptjs.hash(data.password_bash, 10)

            //creating user
            const userCreated = await this.userService.createUser(data)

            //Send email
            try {
                await this.mailService.sendWelcomeEmail(userCreated.correo, { name: userCreated.nombre, username: userCreated.username });
                console.log(`Correo de bienvenida enviado a ${userCreated.correo}`);
            } catch (err) {
                console.error(`Error enviando correo de bienvenida a ${userCreated.correo}:`, err);
            }

            return { message: `Se ha creado el usuario ${userCreated.username} con correo ${userCreated.correo}` };

        } catch (error: any) {
            if (error instanceof BadRequestException) throw error;
            // Prisma error: unique constraint
            if (error.code === 'P2002' && error.meta?.target?.includes('dni')) {
                throw new BadRequestException('Ya existe un usuario con ese DNI.');
            }
            if (error.code === 'P2002' && error.meta?.target?.includes('correo')) {
                throw new BadRequestException('Ya existe un usuario con ese correo.');
            }
            if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
                throw new BadRequestException('Ya existe un usuario con ese username.');
            }
            throw new BadRequestException('El usuario no se ha podido registrar. Por favor, intente nuevamente.');
        }
    }

    async login(data: LoginDto) {
        //1. verificar correo
        const userByEmail = await this.userService.findUserByEmail(data.correo)
        if (!userByEmail) throw new UnauthorizedException(`No existe cuenta asociada al correo ${data.correo}`)
        //2. verificar contraseña
        const isPasswordValid = await bcryptjs.compare(data.password_bash, userByEmail.password_bash);
        if (!isPasswordValid) throw new UnauthorizedException(`Contraseña incorrecta`)

        //3. retornar JWT
        //Paylaod: ¿Que datos NO SENSIBLES van a a viajar en el token? 
        const payload: PayloadInterface = {
            id_usuario: userByEmail.id_usuario,
            email: userByEmail.correo,
            username: userByEmail.username,
            tipo_usuario: userByEmail.tipo_usuario
        };
        const token = await this.jwtService.signAsync(payload)

        return {
            token: token,
            id_usuario: userByEmail.id_usuario,
            username: userByEmail.username,
            email: userByEmail.correo,
            tipo_usuario: userByEmail.tipo_usuario
        }
    }

    async forgotPassword(email: string) {



        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new BadRequestException('No existe un usuario con este correo.');

        // 1. Generar token temporal 
        const payload: PayloadInterface = {
            id_usuario: user.id_usuario,
            email: user.correo,
            username: user.username,
            tipo_usuario: user.tipo_usuario
        };

        const token = await this.jwtService.signAsync(payload,
            {
                secret: this.configService.get<string>('JWT_FORGOT_PASS_SECRET'),
                expiresIn: this.configService.get<string>('JWT_FORGOT_PASS_EXPIRES_IN'),
            },
        );

        // 2. Construir enlace dinámicamente desde FRONTEND_URL
        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        const resetLink = `${frontendUrl}reset-password?token=${token}`;

        // 3. Enviar correo usando tu servicio de mail
        await this.mailService.sendResetPasswordEmail(user.correo, {
            name: user.nombre ?? 'Usuario',
            resetLink,
        });

        return {
            message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña.',
            token
        };
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            //Si la verificación falla, salta al catch
            const payload: PayloadInterface = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_FORGOT_PASS_SECRET'),
            });

            const user = await this.userService.findUserByEmail(payload.email);
            if (!user) throw new UnauthorizedException('Usuario no encontrado.');

            const hashedPassword = await bcryptjs.hash(newPassword, 10);

            const isSamePassword = await bcryptjs.compare(newPassword, user.password_bash);
            if (isSamePassword) throw new BadRequestException('no puedes usar tu contraseña actual');

            await this.userService.updateUser(user.id_usuario, { password_bash: hashedPassword });

            return { message: 'Contraseña actualizada correctamente.' };
        } catch (error) {
            throw error;
        }
    }


}


