import { Body, Controller, Get, Post, UseGuards, Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedRequest } from './dto/request.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { usuario_tipo_usuario } from '@prisma/client';
import { Public } from '../../decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    
    @Public()
    @Post('register')
    register(
        @Body()
        data: RegisterDto
    ){
        return this.authService.register(data);
    }

    @Public()
    @Post('login')
    login(
        @Body()
        data:LoginDto
    ){
        return this.authService.login(data);
    }

    
    //Con UseGuards, definimos procesos que se llevan a cabo ANTES de ejecutar la solicitud
    @Get('profile')
    @Roles(usuario_tipo_usuario.cliente, usuario_tipo_usuario.admin)
    @UseGuards(RolesGuard)
    profile(@Request() req: AuthenticatedRequest){
        //To do: Agregar un Param :id, :username o :email, luego implementar un fetch a dicho usuario y retornar su información
        return req.user;
    }
    
}


