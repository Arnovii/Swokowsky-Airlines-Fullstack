import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  constructor() {
    super({
      log: ['error', 'warn'], // menos carga
    });
  }

  async onModuleInit() {
    if (!(global as any).prismaConnected) {
      await this.$connect();
      (global as any).prismaConnected = true;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
