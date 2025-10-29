import { Module } from '@nestjs/common';
import { RootService } from './root.service';
import { RootController } from './root.controller';
import { PrismaService } from '../../database/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../../mail/mail.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    AuthModule,
    MailModule, 
  ],
  controllers: [RootController],
  providers: [RootService, PrismaService],
})
export class RootModule {}
