import { Body, Controller, Get, Post, UseGuards, Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth/auth.guard';
import type { AuthenticatedRequest } from './dto/request.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    
    @Post('register')
    register(
        @Body()
        data: RegisterDto
    ){
        return this.authService.register(data);
    }

    
    @Post('login')
    login(
        @Body()
        data:LoginDto
    ){
        return this.authService.login(data);
    }

    
    //Con UseGuards, definimos un analisis del request, para determinar si se procesa la solicitud o no
    @Get('profile')
    @UseGuards(AuthGuard)
    profile(@Request() req: AuthenticatedRequest){
        return req.user;
    }
    
}
