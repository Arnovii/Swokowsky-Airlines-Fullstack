import { SetMetadata } from '@nestjs/common';
// Necesitamos una forma de marcar las rutas que NO deben ser protegidas.
// Creamos un decorador ( @Public() ) que setee un metadato en la ruta:
export const Public = () => SetMetadata('isPublic', true);
