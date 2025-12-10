import { Module } from '@nestjs/common';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { PrismaService } from '../../database/prisma.service';
// import { MailService } from '../../mail/mail.service'; // opcional si quieres enviar correos

@Module({
  controllers: [CheckinController],
  providers: [CheckinService, PrismaService], // agrega MailService si lo usas
  exports: [CheckinService],
})
export class CheckinModule {}
