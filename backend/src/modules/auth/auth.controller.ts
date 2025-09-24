
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';


@ApiTags('Autentificación')
@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Registrarse' })
    register(
        @Body()
        data: RegisterDto
    ) {
        return this.authService.register(data);
    }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión - Se genera JWT que debe ser guardado en LocalStorage' })
    @ApiResponse({ status: 200, description: 'Token JWT emitido.' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
    login(
        @Body()
        data: LoginDto
    ) {
        return this.authService.login(data);
    }

    //Solicitar correo para cambiar contraseña
    @Post('forgot-password')
    @ApiOperation({ summary: 'Solicitar el envío de un correo con una URL que contiene un token que permitirá restablecer la contraseña' })
    forgotPassword(@Body() data: ForgotPasswordDto) {
        return this.authService.forgotPassword(data.email);
    }

    //Cambiar la contraseña sin haber iniciado sesión
    @Post('reset-password')
    @ApiOperation({ summary: 'Restablecer la contraseña de un usuario utilizando el token recibido en la URL del correo' })
    resetPassword(@Body() data: ResetPasswordDto) {
        return this.authService.resetPassword(data.token, data.newPassword)
    }


}


