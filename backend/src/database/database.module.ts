import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <- Esto lo hace accesible en toda la app sin volver a importarlo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}