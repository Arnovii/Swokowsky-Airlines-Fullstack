import { Module } from '@nestjs/common';
import { ForoController } from './foro.controller';
import { ForoService } from './foro.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ForoController],
  providers: [ForoService, PrismaService],
})
export class ForoModule {}
