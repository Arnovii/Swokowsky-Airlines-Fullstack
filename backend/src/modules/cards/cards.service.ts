import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  // 📋 Obtener todas las tarjetas del usuario + saldo total
  async getCard(user: PayloadInterface) {
    const tarjetas = await this.prisma.tarjeta.findMany({
      where: { id_usuarioFK: Number(user.id_usuario) },
      orderBy: { creado_en: 'desc' },
    });

    if (!tarjetas || tarjetas.length === 0) {
      throw new NotFoundException('No se encontraron tarjetas para este usuario');
    }

    // Calcular saldo total
    const saldoTotal = tarjetas.reduce((acc, t) => acc + t.saldo, 0);

    return {
      tarjetas,
      saldoTotalUsuario: saldoTotal,
    };
  }

  // 💳 Crear nueva tarjeta con saldo aleatorio
  async createCard(user: PayloadInterface, dto: CreateCardDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: Number(user.id_usuario) },
      select: { id_usuario: true},
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Saldo aleatorio entre 1,000,000 y 5,000,000
    const saldoAleatorio = Math.floor(Math.random() * (5000000 - 1000000 + 1)) + 1000000;

    const nuevaTarjeta = await this.prisma.tarjeta.create({
      data: {
        id_usuarioFK: usuario.id_usuario,
        saldo: saldoAleatorio,
        titular: dto.titular,
        vence_mes: dto.vence_mes,
        vence_anio: dto.vence_anio,
        cvv_ene: dto.cvv_ene,
        tipo: dto.tipo,
        banco: dto.banco,
        creado_en: new Date(),
      },
    });

    // Recalcular saldo total del usuario
    const tarjetasUsuario = await this.prisma.tarjeta.findMany({
      where: { id_usuarioFK: usuario.id_usuario },
      select: { saldo: true },
    });

    const saldoTotal = tarjetasUsuario.reduce((acc, t) => acc + t.saldo, 0);

    // Actualizar el saldo del usuario
    await this.prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { saldo: saldoTotal },
    });

    return {
      message: 'Tarjeta creada correctamente',
      tarjeta: nuevaTarjeta,
      saldoUnitario: saldoAleatorio,
      saldoTotalUsuario: saldoTotal,
    };
  }

  // ❌ Eliminar una tarjeta del usuario
  async deleteCard(user: PayloadInterface, cardId: number) {
    const tarjeta = await this.prisma.tarjeta.findUnique({
      where: { id_tarjeta: cardId },
    });

    if (!tarjeta || tarjeta.id_usuarioFK !== Number(user.id_usuario)) {
      throw new NotFoundException('Tarjeta no encontrada o no pertenece al usuario');
    }

    await this.prisma.tarjeta.delete({ where: { id_tarjeta: cardId } });

    // Recalcular saldo total después de eliminar
    const tarjetasRestantes = await this.prisma.tarjeta.findMany({
      where: { id_usuarioFK: Number(user.id_usuario) },
      select: { saldo: true },
    });

    const saldoTotal = tarjetasRestantes.reduce((acc, t) => acc + t.saldo, 0);

    await this.prisma.usuario.update({
      where: { id_usuario: Number(user.id_usuario) },
      data: { saldo: saldoTotal },
    });

    return {
      message: 'Tarjeta eliminada correctamente',
      saldoTotalUsuario: saldoTotal,
    };
  }
}



