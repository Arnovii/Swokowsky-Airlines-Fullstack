import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Este es un wrapper que convierte PrismaClient en un servicio inyectable de NestJS, para que lo uses en cualquier módulo con Inyección de Dependencias.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect(); // Conectar automáticamente al iniciar
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Cerrar conexión al apagar el módulo
  }
}
