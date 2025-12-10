import { Module } from '@nestjs/common';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { PrismaService } from '../../database/prisma.service';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [MailModule,],
  controllers: [CheckinController],
  providers: [CheckinService, PrismaService], // agrega MailService si lo usas
  exports: [CheckinService],
})
export class CheckinModule {}
