import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

/*
 CanActive --> midleware --> es un middleware especial de NestJS que se ejecuta antes de que el controlador procese la petición.
 Objetivo: Queremos validar que el token recibido junto con el request es válido
 true --> se permite el request y continua flujo normal
 false --> se neiga el acceso al path protegido y se detiene el request 

 to do:
 - una forma de poder acceder al request enviado por un usuario
 - crear método extractTokenFromHeader, el cual extraiga el token del request y lo retorne
 - si existe el token, entonces se verifica con verifyAsync de JwtService (el SECRET se importa del .env)
 - Si el token es válido, retorna true. Caso contrario, retorna false. 
 - Adicionalmente, del Token podemos extraer el payload y enviarlo como un atributo dentro del request. Así, desde el controlador con el decorador @Request, es posible trabajar con dicho atributo. 

*/
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService

  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {// 1. Obtener el objeto request
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Extraer token del header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No se encontró el token en el encabezado');
    }

    try {
      // 3. Verificar token usando el secret desde .env
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 4. Guardar el payload dentro del request (para usarlo en los controladores)
      request['user'] = payload;
      
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Esperamos un header así: Authorization: Bearer <token>
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}