import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera y guarda código único en el ticket
   */
  async generateAndSaveCode(ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id_ticket: ticketId },
      include: { pasajero: true, vuelo: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (!ticket.pasajero) throw new BadRequestException('El ticket no tiene pasajero asociado');

    const base = `${ticket.pasajero.dni}-${ticket.id_vueloFK}-${ticket.id_ticket}-${Date.now()}`;
    const code = crypto.createHash('sha256').update(base).digest('hex').slice(0, 12);

    await this.prisma.ticket.update({
      where: { id_ticket: ticketId },
      data: {
        uniqueCheckinCode: code,
        // no activamos checkinEnabled aquí; la validación comprueba ventana 24h
      },
    });

    return { codigo: code };
  }

  /**
   * Valida código + dni y que falten <=24 horas para la salida
   */
  async validateCode(codigo_unico: string, dni: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { uniqueCheckinCode: codigo_unico },
      include: { pasajero: true, vuelo: true },
    });

    if (!ticket) throw new NotFoundException('Código de check-in inválido');
    if (!ticket.pasajero) throw new BadRequestException('Ticket sin pasajero asociado');
    if (ticket.pasajero.dni !== dni) throw new BadRequestException('El DNI no coincide con el pasajero del ticket');

    const now = new Date();
    const salida = new Date(ticket.vuelo.salida_programada_utc);
    const diffHours = (salida.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours > 24) throw new BadRequestException('El check-in solo está disponible dentro de las 24 horas antes del vuelo');

    if (ticket.checkinCompleted) throw new BadRequestException('El check-in ya fue confirmado para este ticket');

    // Retornar datos útiles para frontend
    return {
      ticketId: ticket.id_ticket,
      id_vuelo: ticket.id_vueloFK,
      pasajero: {
        nombre: `${ticket.pasajero.nombre} ${ticket.pasajero.apellido}`,
        dni: ticket.pasajero.dni,
        email: ticket.pasajero.email,
      },
      asientoComprado: ticket.asiento_numero,
      asientoAsignado: ticket.asientoAsignado ?? null,
      salida: ticket.vuelo.salida_programada_utc,
    };
  }

  /**
   * Construye el mapa completo de asientos para un vuelo a partir de:
   * - configuracion_asientos de la aeronave (cantidad por clase)
   * - tickets existentes (asiento_numero y asientoAsignado)
   *
   * Devuelve { '<codigo>': 'Disponible' | 'Ocupado (vendido)' | 'Ocupado (asignado)' }
   */
  async getSeatsForFlight(id_vuelo: number) {
    // 1) obtener vuelo y su aeronave y configuracion_asientos
    const vuelo = await this.prisma.vuelo.findUnique({
      where: { id_vuelo },
      include: { aeronave: { include: { configuracion_asientos: true } } },
    });
    if (!vuelo) throw new NotFoundException('Vuelo no encontrado');

    // 2) generar códigos por cada config (prefijo: 'P' para primera_clase, 'E' para economica)
    const configs = vuelo.aeronave.configuracion_asientos;
    const seatCodes: string[] = [];
    configs.forEach((cfg) => {
      const prefix = cfg.clase === 'primera_clase' ? 'P' : 'E';
      for (let i = 1; i <= cfg.cantidad; i++) {
        seatCodes.push(`${prefix}-${i}`);
      }
    });

    // 3) obtener tickets del vuelo para conocer asientos vendidos/asignados
    const tickets = await this.prisma.ticket.findMany({
      where: { id_vueloFK: id_vuelo },
      select: { asiento_numero: true, asientoAsignado: true, estado: true },
    });

    const map: Record<string, string> = {};
    seatCodes.forEach((code) => (map[code] = 'Disponible'));

    for (const t of tickets) {
      if (t.asiento_numero) {
        map[t.asiento_numero] = 'Ocupado (vendido)';
      }
      if (t.asientoAsignado) {
        // si ya marcado como vendido lo mantenemos, sino marcamos como asignado
        if (map[t.asientoAsignado] === 'Disponible') {
          map[t.asientoAsignado] = 'Ocupado (asignado)';
        } else {
          // deja el valor (vendido tiene prioridad)
        }
      }
    }

    return map;
  }

  /**
   * Asignar asiento al ticket usando el código único.
   * Verifica:
   * - ticket válido
   * - ventana <=24h
   * - asiento existe en la configuración del avión
   * - asiento no esté ocupado por otro ticket (vendido o asignado)
   */
  async assignSeat(codigo_unico: string, asientoCodigo: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { uniqueCheckinCode: codigo_unico },
      include: { vuelo: true, pasajero: true },
    });
    if (!ticket) throw new NotFoundException('Código de check-in inválido');
    if (!ticket.pasajero) throw new BadRequestException('Ticket sin pasajero');

    const now = new Date();
    const salida = new Date(ticket.vuelo.salida_programada_utc);
    const diffHours = (salida.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) throw new BadRequestException('El asiento solo se puede seleccionar dentro de las 24 horas antes del vuelo');

    // Reusar getSeatsForFlight para validar existencia y estado
    const seatMap = await this.getSeatsForFlight(ticket.id_vueloFK);
    if (!seatMap.hasOwnProperty(asientoCodigo)) {
      throw new NotFoundException('El asiento no existe para este vuelo');
    }

    const estado = seatMap[asientoCodigo];
    if (estado !== 'Disponible') {
      throw new ConflictException('El asiento está ocupado');
    }

    // Actualizar ticket.asientoAsignado (no confirmamos check-in aun)
    const updated = await this.prisma.ticket.update({
      where: { id_ticket: ticket.id_ticket },
      data: { asientoAsignado: asientoCodigo },
    });

    return {
      message: 'Asiento asignado correctamente',
      asientoAsignado: updated.asientoAsignado,
    };
  }

  /**
   * Confirmar check-in: marcar checkinCompleted, borrar código, setear fecha y (opcional) disparar email
   */
  async confirmCheckin(codigo_unico: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { uniqueCheckinCode: codigo_unico },
      include: { pasajero: true, vuelo: true },
    });
    if (!ticket) throw new NotFoundException('Código de check-in inválido');

    if (!ticket.asientoAsignado) throw new BadRequestException('Debe seleccionar un asiento antes de confirmar el check-in');

    if (ticket.checkinCompleted) throw new BadRequestException('El check-in ya fue confirmado');

    const updated = await this.prisma.ticket.update({
      where: { id_ticket: ticket.id_ticket },
      data: {
        checkinCompleted: true,
        checkinCompletedAt: new Date(),
        checkinEnabled: false,
        uniqueCheckinCode: null,
      },
    });

    // Opcional: enviar correo usando tu MailModule
    // Si tienes un MailService exportado por MailModule, inyectalo en el constructor y úsalo aquí.
    // Ej:
    // await this.mailService.sendCheckinConfirmation(ticket.pasajero.email, { ticketId: ticket.id_ticket, asiento: ticket.asientoAsignado });

    return {
      message: 'Check-in confirmado con éxito',
      ticketId: updated.id_ticket,
      asiento: updated.asientoAsignado,
    };
  }
}
