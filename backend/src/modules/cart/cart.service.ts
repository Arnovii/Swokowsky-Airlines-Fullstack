import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { Prisma } from '@prisma/client';

// Tipos locales para tipar la respuesta del carrito
type FlightSummary = {
  id_vuelo: number;
  salida_programada_utc: Date;
  llegada_programada_utc: Date;
  tarifas: { clase: string; precio_base: number }[];
  promocion: { id_promocion: number; nombre: string; descuento: number } | null;
  aeropuerto_origen: {
    id_aeropuerto: number;
    nombre: string;
    codigo_iata: string;
    ciudad: string | null;
    pais: string | null;
  } | null;
  aeropuerto_destino: {
    id_aeropuerto: number;
    nombre: string;
    codigo_iata: string;
    ciudad: string | null;
    pais: string | null;
  } | null;
  aeronave: { id_aeronave: number; modelo: string } | null;
};

type EnrichedCartItem = {
  id_item_carrito: number;
  id_vueloFK: number;
  cantidad_de_tickets: number;
  clase: string; // o use asiento_clases si lo importas de Prisma: asiento_clases
  fecha_limite: Date;
  creado_en: Date;
  tiempo_restante_segundos: number;
  disponibilidad_para_item: number;
  capacidad_clase: number;
  pagos_existentes: number;
  reservas_activas_total_para_clase: number;
  vuelo: FlightSummary | null;
};

type CartResponse = {
  id_carrito: number | null;
  items: EnrichedCartItem[];
};


@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) { }






  /**
 * Recupera el carrito del usuario (items activos).
 * - Borra items expirados al inicio
 * - Devuelve items activos con info del vuelo y disponibilidad por item
 */
  async getCart(user: PayloadInterface) {
    if (!user) throw new UnauthorizedException('Debe iniciar sesión.');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1) obtener carrito del usuario
      const carrito = await tx.carrito.findUnique({
        where: { id_usuarioFK: Number(user.id_usuario) },
      });

      if (!carrito) {
        return { id_carrito: null, items: [] };
      }

      const ahora = this.now();

      // 2) eliminar ítems expirados del propio carrito
      await tx.carrito_item.deleteMany({
        where: {
          id_carritoFK: carrito.id_carrito,
          fecha_limite: { lte: ahora },
        },
      });

      // 3) recuperar items activos con info de vuelo (incluimos tarifas y promoción y aeropuertos)
      const items = await tx.carrito_item.findMany({
        where: {
          id_carritoFK: carrito.id_carrito,
          fecha_limite: { gt: ahora },
        },
        include: {
          vuelo: {
            include: {
              tarifa: true,
              promocion: true,
              aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
                include: { ciudad: { include: { pais: true, gmt: true } } },
              },
              aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
                include: { ciudad: { include: { pais: true, gmt: true } } },
              },
              aeronave: true,
            },
          },
        },
      });

      // 4) para cada item, calcular disponibilidad y tiempo restante
      const enrichedItems: EnrichedCartItem[] = [];
      for (const item of items) {
        const vuelo = item.vuelo;

        // Obtener configuración de la clase en la aeronave
        let config = null as { cantidad: number } | null;
        if (vuelo && vuelo.id_aeronaveFK) {
          // casteamos el resultado para que TypeScript sepa que existe `cantidad`
          config = (await tx.configuracion_asientos.findFirst({
            where: { id_aeronaveFK: vuelo.id_aeronaveFK, clase: item.clase },
            select: { cantidad: true },
          })) as { cantidad: number } | null;
        }

        // tickets pagados para ese vuelo+clase
        const paidCount = await tx.ticket.count({
          where: {
            id_vueloFK: item.id_vueloFK,
            asiento_clase: item.clase,
            estado: 'pagado',
          },
        });

        // reservas activas en otros carritos (sum)
        const reservedAgg = (await tx.carrito_item.aggregate({
          _sum: { cantidad_de_tickets: true },
          where: {
            id_vueloFK: item.id_vueloFK,
            clase: item.clase,
            fecha_limite: { gt: ahora },
          },
        })) as { _sum: { cantidad_de_tickets: number | null } };

        const reservedTotal = reservedAgg._sum?.cantidad_de_tickets ?? 0;

        // Excluir la propia cantidad para calcular "otros reservados"
        const reservedOthers = Math.max(0, reservedTotal - item.cantidad_de_tickets);

        const capacidadClase = config?.cantidad ?? 0;
        const availableForThisItem = Math.max(0, capacidadClase - (paidCount + reservedOthers));

        // tiempo restante en segundos
        const timeLeftMs = Math.max(0, item.fecha_limite.getTime() - ahora.getTime());
        const timeLeftSeconds = Math.floor(timeLeftMs / 1000);

        const vueloSummary = vuelo
          ? {
            id_vuelo: vuelo.id_vuelo,
            salida_programada_utc: vuelo.salida_programada_utc,
            llegada_programada_utc: vuelo.llegada_programada_utc,
            tarifas: vuelo.tarifa?.map((t) => ({ clase: t.clase, precio_base: t.precio_base })) ?? [],
            promocion: vuelo.promocion
              ? { id_promocion: vuelo.promocion.id_promocion, nombre: vuelo.promocion.nombre, descuento: vuelo.promocion.descuento }
              : null,
            aeropuerto_origen: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto
              ? {
                id_aeropuerto: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.id_aeropuerto,
                nombre: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.nombre,
                codigo_iata: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.codigo_iata,
                ciudad: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad?.nombre ?? null,
                pais: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad?.pais?.nombre ?? null,
              }
              : null,
            aeropuerto_destino: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto
              ? {
                id_aeropuerto: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.id_aeropuerto,
                nombre: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.nombre,
                codigo_iata: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.codigo_iata,
                ciudad: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad?.nombre ?? null,
                pais: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad?.pais?.nombre ?? null,
              }
              : null,
            aeronave: vuelo.aeronave ? { id_aeronave: vuelo.aeronave.id_aeronave, modelo: vuelo.aeronave.modelo } : null,
          }
          : null;

        enrichedItems.push({
          id_item_carrito: item.id_item_carrito,
          id_vueloFK: item.id_vueloFK,
          cantidad_de_tickets: item.cantidad_de_tickets,
          clase: item.clase,
          fecha_limite: item.fecha_limite,
          creado_en: item.creado_en,
          tiempo_restante_segundos: timeLeftSeconds,
          disponibilidad_para_item: availableForThisItem,
          capacidad_clase: capacidadClase,
          pagos_existentes: paidCount,
          reservas_activas_total_para_clase: reservedTotal,
          vuelo: vueloSummary,
        });
      }

      return {
        id_carrito: carrito.id_carrito,
        items: enrichedItems,
      } as CartResponse;

    });
  }


  private async getValidezHoras(tx?: any): Promise<number> {
    const client = tx ?? this.prisma;
    const record = await client.constantes.findUnique({ where: { clave: 'validez_item_carrito' } });
    if (!record) return 24;
    const parsed = Number(record.valor);
    return isNaN(parsed) ? 24 : parsed;
  }

  private now(): Date {
    return new Date();
  }

  // Recupera o crea el carrito del usuario (1:1)
  private async getOrCreateCartForUser(userId: number, tx?: any) {
    const client = tx ?? this.prisma;
    let carrito = await client.carrito.findUnique({ where: { id_usuarioFK: userId } });
    if (!carrito) {
      carrito = await client.carrito.create({ data: { id_usuarioFK: userId } });
    }
    return carrito;
  }

  // Añadir item al carrito (si ya existe item para mismo vuelo+clase en el carrito, lo suma hasta 5)
  async addItemToCart(user: PayloadInterface, dto: AddCartItemDto) {
    if (!user) throw new UnauthorizedException('Debe iniciar sesión.');

    const { id_vueloFK, cantidad_de_tickets, clase } = dto;
    if (!id_vueloFK || !cantidad_de_tickets || cantidad_de_tickets < 1) {
      throw new BadRequestException('Parámetros inválidos.');
    }
    if (cantidad_de_tickets > 5) {
      throw new BadRequestException('La cantidad máxima por item es 5.');
    }

    // Ejecutamos lógica en transacción para consistencia
    return this.prisma.$transaction(async (tx) => {
      // 1) obtener vuelo y su aeronave
      const vuelo = await tx.vuelo.findUnique({ where: { id_vuelo: id_vueloFK } });
      if (!vuelo) throw new NotFoundException('Vuelo no encontrado.');

      const aeronaveId = vuelo.id_aeronaveFK;

      // 2) capacidad configurada para la clase
      const config = await tx.configuracion_asientos.findFirst({
        where: { id_aeronaveFK: aeronaveId, clase }
      });
      if (!config) throw new NotFoundException('No existe configuración de asientos para esta clase en la aeronave.');

      // 3) obtener validez (horas) y fecha_limite
      const validezHoras = await this.getValidezHoras(tx);
      const fecha_limite = new Date(Date.now() + validezHoras * 3600 * 1000);

      // 4) obtener/crear carrito
      const carrito = await this.getOrCreateCartForUser(Number(user.id_usuario), tx);

      // 5) buscar si ya existe un item activo (misma clase y vuelo) en este carrito
      const existingItem = await tx.carrito_item.findFirst({
        where: {
          id_carritoFK: carrito.id_carrito,
          id_vueloFK,
          clase,
          fecha_limite: { gt: this.now() }
        }
      });

      // 6) contar tickets pagados para este vuelo+clase
      const paidCount = await tx.ticket.count({
        where: { id_vueloFK, asiento_clase: clase, estado: 'pagado' }
      });

      // 7) sumar reservas activas de otros carritos para el mismo vuelo+clase
      const reservedAgg = await tx.carrito_item.aggregate({
        _sum: { cantidad_de_tickets: true },
        where: {
          id_vueloFK,
          clase,
          fecha_limite: { gt: this.now() },
          // incluimos todos: si existe item del mismo usuario lo incluimos a continuación en la lógica
        }
      });
      const reservedTotal = reservedAgg._sum.cantidad_de_tickets ?? 0;

      // Si existe existingItem, queremos calcular reservados SIN contarlo (porque lo vamos a actualizar)
      let reservedOthers = reservedTotal;
      if (existingItem) {
        reservedOthers = reservedTotal - existingItem.cantidad_de_tickets;
      }

      // 8) calcular disponibilidad
      const ocupadosPrevios = paidCount + reservedOthers;
      const nuevoCantidad = existingItem ? existingItem.cantidad_de_tickets + cantidad_de_tickets : cantidad_de_tickets;

      if (nuevoCantidad > 5) {
        throw new BadRequestException('Máximo 5 tickets por item permitido.');
      }

      if (ocupadosPrevios + nuevoCantidad > config.cantidad) {
        throw new BadRequestException('No hay cupo suficiente para la cantidad solicitada.');
      }

      // 9) crear o actualizar item
      if (existingItem) {
        const updated = await tx.carrito_item.update({
          where: { id_item_carrito: existingItem.id_item_carrito },
          data: {
            cantidad_de_tickets: existingItem.cantidad_de_tickets + cantidad_de_tickets,
            fecha_limite // refrescamos fecha_limite al re-agregar
          }
        });
        return { message: 'Item actualizado en carrito', item: updated };
      } else {
        const created = await tx.carrito_item.create({
          data: {
            id_carritoFK: carrito.id_carrito,
            id_vueloFK,
            cantidad_de_tickets,
            fecha_limite,
            clase,
          }
        });
        return { message: 'Item agregado al carrito', item: created };
      }
    });
  }

  // Actualizar cantidad de tickets de un item (máximo 5). Se valida disponibilidad excluyendo el propio item.
  async updateCartItem(user: PayloadInterface, id_item_carrito: number, dto: UpdateCartItemDto) {
    if (!user) throw new UnauthorizedException('Debe iniciar sesión.');
    const { cantidad_de_tickets } = dto;
    if (!cantidad_de_tickets || cantidad_de_tickets < 1) throw new BadRequestException('Cantidad inválida.');
    if (cantidad_de_tickets > 5) throw new BadRequestException('La cantidad máxima por item es 5.');

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.carrito_item.findUnique({ where: { id_item_carrito } });
      if (!item) throw new NotFoundException('Item del carrito no encontrado.');

      // Verificar que el item pertenezca al carrito del usuario
      const carrito = await tx.carrito.findUnique({ where: { id_carrito: item.id_carritoFK } });
      if (!carrito || carrito.id_usuarioFK !== Number(user.id_usuario)) {
        throw new UnauthorizedException('No tiene permiso sobre este item.');
      }

      // Obtener vuelo y config
      const vuelo = await tx.vuelo.findUnique({ where: { id_vuelo: item.id_vueloFK } });
      if (!vuelo) throw new NotFoundException('Vuelo asociado no encontrado.');
      const aeronaveId = vuelo.id_aeronaveFK;
      const config = await tx.configuracion_asientos.findFirst({ where: { id_aeronaveFK: aeronaveId, clase: item.clase } });
      if (!config) throw new NotFoundException('No existe configuración para esta clase en la aeronave.');

      // Contar tickets pagados
      const paidCount = await tx.ticket.count({
        where: { id_vueloFK: item.id_vueloFK, asiento_clase: item.clase, estado: 'pagado' }
      });

      // Reserved from other items (excluyendo este item)
      const reservedAgg = await tx.carrito_item.aggregate({
        _sum: { cantidad_de_tickets: true },
        where: {
          id_vueloFK: item.id_vueloFK,
          clase: item.clase,
          fecha_limite: { gt: this.now() },
          id_item_carrito: { not: id_item_carrito }
        }
      });
      const reservedOthers = reservedAgg._sum.cantidad_de_tickets ?? 0;

      // total after update
      const totalAfter = paidCount + reservedOthers + cantidad_de_tickets;
      if (totalAfter > config.cantidad) {
        throw new BadRequestException('No hay cupo suficiente para la nueva cantidad.');
      }

      const updated = await tx.carrito_item.update({
        where: { id_item_carrito },
        data: { cantidad_de_tickets }
      });

      return { message: 'Cantidad actualizada', item: updated };
    });
  }

  // Eliminar item del carrito
  async removeCartItem(user: PayloadInterface, id_item_carrito: number) {
    if (!user) throw new UnauthorizedException('Debe iniciar sesión.');

    // Verificamos pertenencia y borramos
    const item = await this.prisma.carrito_item.findUnique({ where: { id_item_carrito } });
    if (!item) throw new NotFoundException('Item del carrito no encontrado.');

    const carrito = await this.prisma.carrito.findUnique({ where: { id_carrito: item.id_carritoFK } });
    if (!carrito || carrito.id_usuarioFK !== Number(user.id_usuario)) {
      throw new UnauthorizedException('No tiene permiso sobre este item.');
    }

    await this.prisma.carrito_item.delete({ where: { id_item_carrito } });
    return { message: 'Item eliminado correctamente' };
  }


}
