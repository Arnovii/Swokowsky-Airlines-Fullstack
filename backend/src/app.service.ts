import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'prueba de backend esto lotoy po desde el frontend';
  }
}
