import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/*
Objetivo: 
*/
@Injectable()
export class InternalKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  
  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const internalKeyHeader = request.headers['x-internal-key'];
    const expectedKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!internalKeyHeader) {
      throw new UnauthorizedException('Falta clave interna');
    }

    if (internalKeyHeader !== expectedKey) {
      throw new UnauthorizedException('Clave interna no válida');
    }
    return true;
  }
}
