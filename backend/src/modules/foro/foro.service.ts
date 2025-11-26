import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHiloDto } from './dto/create-hilo.dto';
import { ReplyHiloDto } from './dto/reply-hilo.dto';

@Injectable()
export class ForoService {
  constructor(private prisma: PrismaService) {}

  // Crear hilo
  async crearHilo(dto: CreateHiloDto, id_usuario: number) {
    return this.prisma.foro_hilo.create({
      data: {
        titulo: dto.titulo,
        contenido: dto.contenido,
        categoria: dto.categoria,
        id_usuarioFK: id_usuario,
      },
    });
  }

  // Responder hilo
  async responderHilo(id_hilo: number, dto: ReplyHiloDto, id_usuario: number) {
    // Verificar si el hilo existe
    const existe = await this.prisma.foro_hilo.findUnique({
      where: { id_hilo },
    });

    if (!existe) throw new NotFoundException('Hilo no encontrado');

    return this.prisma.foro_respuesta.create({
      data: {
        contenido: dto.contenido,
        id_hiloFK: id_hilo,
        id_usuarioFK: id_usuario,
      },
    });
  }

  // Obtener hilo completo
  async getHiloCompleto(id_hilo: number) {
    return this.prisma.foro_hilo.findUnique({
      where: { id_hilo },
      include: {
        autor: true,
        respuestas: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  // Hilos creados por un usuario
  async getHilosPorUsuario(id_usuario: number) {
    return this.prisma.foro_hilo.findMany({
      where: { id_usuarioFK: id_usuario },
      include: { respuestas: true },
      orderBy: { creado_en: 'desc' },
    });
  }

  // Todos los hilos (solo admin/root)
  async getTodosLosHilos() {
    return this.prisma.foro_hilo.findMany({
      include: {
        autor: true,
        respuestas: true,
      },
      orderBy: { creado_en: 'desc' },
    });
  }
}


