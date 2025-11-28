import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserHistory(userId: number) {

    // 🎟️ Tickets: Compras y Reembolsos
    const tickets = await this.prisma.ticket.findMany({
      where: { id_usuarioFK: userId },
      select: {
        id_ticket: true,
        precio: true,
        estado: true,
        creado_en: true,
      },
      orderBy: { creado_en: 'desc' }
    });

    const history = tickets
      .map(t => ({
        type:
          t.estado === 'pagado'
            ? 'COMPRA'
            : t.estado === 'cancelado'
            ? 'REEMBOLSO'
            : null,
        amount: t.precio,
        createdAt: t.creado_en,
        reference: `ticket #${t.id_ticket}`,
      }))
      .filter(t => t.type !== null); // remover "usado" o cualquier otro estado

    return history;
  }
}
