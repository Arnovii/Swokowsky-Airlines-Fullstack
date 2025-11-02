import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { asiento_clases, ticket_estado } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crea un ticket con asiento asignado aleatoriamente y estado 'Pagado' por defecto.
   */
  async createTicket(
    idUsuario: number,
    idVuelo: number,
    clase: asiento_clases,
    precio: number
  ) {
    // 1️⃣ Verificar que el vuelo existe
    const vuelo = await this.prisma.vuelo.findUnique({
      where: { id_vuelo: idVuelo },
    });
    if (!vuelo) throw new NotFoundException('El vuelo no existe');

    // 2️⃣ Obtener la aeronave asociada al vuelo
    const idAeronave = vuelo.id_aeronaveFK;

    // 3️⃣ Buscar la configuración de asientos por clase
    const configAsiento = await this.prisma.configuracion_asientos.findFirst({
      where: {
        id_aeronaveFK: idAeronave,
        clase:
          clase === asiento_clases.economica
            ? asiento_clases.economica
            : asiento_clases.primera_clase, // ✅ Conversión correcta
      },
    });
    if (!configAsiento)
      throw new NotFoundException(`No hay configuración de asientos para ${clase}`);

    const totalAsientos = configAsiento.cantidad;

    // 4️⃣ Obtener asientos ya ocupados en ese vuelo y clase
    const asientosOcupados = await this.prisma.ticket.findMany({
      where: {
        id_vueloFK: idVuelo,
        asiento_clase: clase,
        estado: ticket_estado.pagado, // solo se consideran pagados
      },
      select: { asiento_numero: true },
    });

    const ocupados = asientosOcupados.map(a => a.asiento_numero);
    const disponibles: string[] = [];

    // 5️⃣ Generar lista de asientos disponibles
    for (let i = 1; i <= totalAsientos; i++) {
      const asientoCodigo = `${clase === asiento_clases.primera_clase ? 'P' : 'E'}-${i}`;
      if (!ocupados.includes(asientoCodigo)) {
        disponibles.push(asientoCodigo);
      }
    }

    if (disponibles.length === 0)
      throw new BadRequestException(`No hay asientos disponibles en ${clase}`);

    // 6️⃣ Elegir un asiento aleatorio
    const randomIndex = Math.floor(Math.random() * disponibles.length);
    const asientoAsignado = disponibles[randomIndex];

    // 7️⃣ Crear el ticket directamente como 'Pagado'
    const nuevoTicket = await this.prisma.ticket.create({
      data: {
        id_usuarioFK: idUsuario,
        id_vueloFK: idVuelo,
        asiento_numero: asientoAsignado,
        asiento_clase: clase,
        precio,
        estado: ticket_estado.pagado, // 🔥 ya se guarda como pagado
      },
    });

    return {
      message: 'Ticket creado y marcado como pagado exitosamente',
      asiento_asignado: asientoAsignado,
      ticket: nuevoTicket,
    };
  }

  /**
   * Obtiene todos los tickets pagados de un usuario
   */
  async getTicketsByUser(idUsuario: number) {
    return this.prisma.ticket.findMany({
      where: {
        id_usuarioFK: idUsuario,
        estado: ticket_estado.pagado, // 🔥 solo pagados
      },
      include: {
        vuelo: true,
        pasajero: true,   // ✅ se agrega aquí
      },
      orderBy: { creado_en: 'desc' },
    });
  }

}
