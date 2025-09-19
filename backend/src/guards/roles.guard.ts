import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../modules/auth/dto/request.dto';
import { PayloadInterface } from '../modules/auth/dto/payload.dto';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener roles requeridos de la ruta (definidos en el controlador)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Si no hay roles definidos, permitir acceso
    }

    // 2. Obtener usuario del request
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user: PayloadInterface = request.user;

    if (!user) throw new ForbiddenException('Usuario no autenticado');

    // 3. Verificar si el rol del usuario está en la lista de roles permitidos
    if (!requiredRoles.includes(user.tipo_usuario)) {
      throw new ForbiddenException(`No tienes permisos para acceder a esta ruta`);
    }

    return true;
  }
}
