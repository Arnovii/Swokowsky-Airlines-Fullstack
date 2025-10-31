import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { CheckoutDto } from './dto/checkout.dto';
import { TicketService } from '../ticket/ticket.service';
import { PasajeroService } from '../pasajero/pasajero.service';
import { MailService } from '../../mail/mail.service';
import { CartService } from '../cart/cart.service';
import { asiento_clases } from '@prisma/client';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly ticketService: TicketService,
    private readonly pasajeroService: PasajeroService,
    private readonly mailService: MailService,
    private readonly cartService: CartService,
  ) {}

  async processCheckout(user: any, checkoutDto: CheckoutDto) {
    const { total, pasajeros } = checkoutDto;
    const saldo = user.saldo;

    if (saldo < total) {
      return { success: false, message: 'Saldo insuficiente para realizar el pago.' };
    }

    // Obtener carrito actual del usuario
    const carrito = await this.cartService.getCart(user);
    if (!carrito || !carrito.items || carrito.items.length === 0) {
      return { success: false, message: 'El carrito está vacío.' };
    }

    // Crear tickets y pasajeros para cada item del carrito
  const tickets: any[] = [];
    for (let i = 0; i < carrito.items.length; i++) {
      const item = carrito.items[i];
      // Se asume que la cantidad de pasajeros coincide con la cantidad de tickets
      for (let j = 0; j < item.cantidad_de_tickets; j++) {
        const pasajeroDto = pasajeros[j] || pasajeros[0]; // fallback al primero si no hay suficientes
        // Crear ticket
        // Convertir clase a enum asiento_clases
        let claseEnum: asiento_clases;
        if (item.clase === 'economica') {
          claseEnum = asiento_clases.economica;
        } else if (item.clase === 'primera_clase' || item.clase === 'PrimeraClase') {
          claseEnum = asiento_clases.primera_clase;
        } else {
          throw new BadRequestException('Clase de asiento inválida en el carrito');
        }
        const ticket = await this.ticketService.createTicket(
          Number(user.id_usuario),
          item.id_vueloFK,
          claseEnum,
          item.vuelo?.tarifas?.find(t => t.clase === item.clase)?.precio_base || 0
        );
        // Procesar pasajero (no se guarda en BD, solo lógica temporal)
        await this.pasajeroService.processPasajero(pasajeroDto);
        tickets.push(ticket);
      }
    }

    // Enviar correo de confirmación (ajusta el template y datos según tu lógica)
    if (user.email) {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Compra de tickets exitosa',
        template: 'new-notification',
        context: {
          nombre: user.nombre,
          tickets,
        },
      });
    }

    // Vaciar carrito del usuario (elimina todos los items activos)
    const carritoId = carrito.id_carrito;
    if (carritoId) {
      // Usar PrismaService directamente para vaciar el carrito
      const prisma = (this.cartService as any).prisma;
      if (prisma && prisma.carrito_item) {
        await prisma.carrito_item.deleteMany({ where: { id_carritoFK: carritoId } });
      }
    }

    return { success: true, message: 'Pago realizado y tickets generados correctamente.', tickets };
  }
}
