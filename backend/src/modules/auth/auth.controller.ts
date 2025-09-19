import { Body, Controller, Get, Post, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


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

}


