import { Request } from 'express';
import { PayloadInterface } from './payload.interface';

export interface AuthenticatedUserRequest extends Request {
  user: PayloadInterface & {   // Hacemos que "user" tenga la estructura de PayloadInterface más las propiedades opcionales
        iat?: number;   // issued at (opcional)
        exp?: number;   // expiration (opcional)
    };
}
