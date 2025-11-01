import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PayloadInterface } from 'src/common/interfaces/payload.interface';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) { }

  // 🔹 Consultar saldo actual del usuario
  async getSaldo(user: PayloadInterface) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: Number(user.id_usuario) },
      select: { saldo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      mensege: 'Saldo acatual',
      saldoActual: usuario.saldo,
    };
  }
}  
