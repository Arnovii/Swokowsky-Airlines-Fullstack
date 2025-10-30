import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { TicketModule } from '../ticket/ticket.module';
import { PasajeroModule } from '../pasajero/pasajero.module';
import { MailModule } from '../../mail/mail.module';
import { CartModule } from '../cart/cart.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TicketModule, PasajeroModule, MailModule, CartModule, AuthModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
