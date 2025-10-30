import { Module } from '@nestjs/common';
import { RootService } from './root.service';
import { RootController } from './root.controller';
import { PrismaService } from '../../database/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [
    AuthModule,
    MailModule,
    UsersModule 
  ],
  controllers: [RootController],
  providers: [RootService, PrismaService],
})
export class RootModule {}
