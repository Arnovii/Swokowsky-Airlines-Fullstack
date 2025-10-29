import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCardDto) {
    return this.prisma.tarjeta.create({ data });
  }

  async findAll() {
    return this.prisma.tarjeta.findMany({
      include: { usuario: true }, // opcional si quieres mostrar usuario
    });
  }

  async findOne(id: number) {
    return this.prisma.tarjeta.findUnique({
      where: { id_tarjeta: id },
      include: { usuario: true },
    });
  }

  async remove(id: number) {
    return this.prisma.tarjeta.delete({
      where: { id_tarjeta: id },
    });
  }
}

