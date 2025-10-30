import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RechargeDto } from './dto/recharge.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 Consultar saldo actual del usuario
  async getSaldo(idUsuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { saldo: true },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return { saldo: usuario.saldo };
  }

  // 🔹 Recargar saldo usando una tarjeta registrada
  async recargarSaldo(data: RechargeDto) {
    const { idUsuario, monto, idTarjeta } = data;

    // Verificar que el usuario exista
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Verificar que la tarjeta pertenezca al usuario
    const tarjeta = await this.prisma.tarjeta.findFirst({
      where: { id_tarjeta: idTarjeta, id_usuarioFK: idUsuario },
    });
    if (!tarjeta) throw new BadRequestException('Tarjeta no válida o no pertenece al usuario');

    // Actualizar saldo y registrar transacción
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data: {
        saldo: { increment: monto },
        transacciones: {
          create: {
            monto,
            tipo: 'recarga',
          },
        },
      },
      include: { transacciones: true },
    });

    return {
      mensaje: '💳 Recarga exitosa',
      nuevoSaldo: usuarioActualizado.saldo,
    };
  }
}
