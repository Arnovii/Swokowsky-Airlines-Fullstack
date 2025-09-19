import { SetMetadata } from '@nestjs/common';
import { usuario_tipo_usuario } from '@prisma/client';

// Este decorador es para definir en el controlador las rutas que requieren de un tipo de usuario en especial para ser ejectuadas
export const ROLES_KEY = 'roles';

// Los roles se definen en el decorador, usando los valores de `usuario_tipo_usuario` de Prisma
export const Roles = (...roles: (keyof typeof usuario_tipo_usuario)[]) => {
  // Aseguramos que el decorador acepte los valores correctos de `usuario_tipo_usuario`
  const rolesList = roles.map(role => usuario_tipo_usuario[role]);
  return SetMetadata(ROLES_KEY, rolesList);
};