import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  // Responder hilo (solo autor del hilo o admin/root)
  async responderHilo(id_hilo: number, dto: ReplyHiloDto, id_usuario: number) {
    // Obtener el hilo con el autor
    const hilo = await this.prisma.foro_hilo.findUnique({
      where: { id_hilo },
      include: { autor: true },
    });

    if (!hilo) throw new NotFoundException('Hilo no encontrado');

    // Obtener el usuario que intenta responder
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      select: { tipo_usuario: true },
    });

    // Verificar si es autor del hilo o admin/root
    const esAutor = hilo.id_usuarioFK === id_usuario;
    const esAdmin = usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'root';

    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('Solo el autor del hilo o un administrador pueden responder');
    }

    return this.prisma.foro_respuesta.create({
      data: {
        contenido: dto.contenido,
        id_hiloFK: id_hilo,
        id_usuarioFK: id_usuario,
      },
    });
  }

  // Obtener hilo completo con verificación de permisos
  // Solo el autor o admin/root pueden ver el hilo
  async getHiloCompletoConPermisos(id_hilo: number, id_usuario: number) {
    const hilo = await this.getHiloCompleto(id_hilo);
    
    if (!hilo) {
      throw new NotFoundException('Hilo no encontrado');
    }

    // Verificar permisos
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      select: { tipo_usuario: true },
    });

    const esAutor = hilo.id_usuarioFK === id_usuario;
    const esAdmin = usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'root';

    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No tienes permiso para ver este hilo');
    }

    return hilo;
  }

  // Obtener hilo completo (sin verificación de permisos - uso interno)
  async getHiloCompleto(id_hilo: number) {
    const hilo = await this.prisma.foro_hilo.findUnique({
      where: { id_hilo },
      include: {
        autor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
            tipo_usuario: true,
          },
        },
        respuestas: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre: true,
                apellido: true,
                username: true,
                img_url: true,
                tipo_usuario: true,
              },
            },
          },
          orderBy: { creado_en: 'asc' },
        },
      },
    });

    // Mapear 'usuario' a 'autor' para las respuestas
    if (hilo && hilo.respuestas) {
      hilo.respuestas = hilo.respuestas.map((resp: any) => ({
        ...resp,
        autor: resp.usuario,
      }));
    }

    return hilo;
  }

  // Hilos creados por un usuario
  async getHilosPorUsuario(id_usuario: number) {
    return this.prisma.foro_hilo.findMany({
      where: { id_usuarioFK: id_usuario },
      include: {
        autor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
            tipo_usuario: true,
          },
        },
        _count: {
          select: { respuestas: true },
        },
      },
      orderBy: { creado_en: 'desc' },
    });
  }

  // Todos los hilos (público y admin/root)
  async getTodosLosHilos() {
    return this.prisma.foro_hilo.findMany({
      include: {
        autor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
            tipo_usuario: true,
          },
        },
        _count: {
          select: { respuestas: true },
        },
      },
      orderBy: { creado_en: 'desc' },
    });
  }

  // Obtener hilos filtrados según el tipo de usuario
  // - Admin/Root: ven todos los hilos
  // - Cliente: solo ven sus propios hilos
  async getHilosFiltrados(id_usuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      select: { tipo_usuario: true },
    });

    const esAdmin = usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'root';

    return this.prisma.foro_hilo.findMany({
      where: esAdmin ? {} : { id_usuarioFK: id_usuario },
      include: {
        autor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
            tipo_usuario: true,
          },
        },
        _count: {
          select: { respuestas: true },
        },
      },
      orderBy: { creado_en: 'desc' },
    });
  }
}


