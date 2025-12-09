import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateConversacionDto } from './dto/create-conversacion.dto';
import { SendMensajeDto } from './dto/send-mensaje.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva conversación (solo clientes)
  async crearConversacion(dto: CreateConversacionDto, id_usuario: number) {
    // Crear la conversación con el mensaje inicial
    const conversacion = await this.prisma.chat_conversacion.create({
      data: {
        asunto: dto.asunto,
        id_usuarioFK: id_usuario,
        mensajes: {
          create: {
            contenido: dto.mensaje,
            id_autorFK: id_usuario,
          },
        },
      },
      include: {
        mensajes: {
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
          },
        },
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
          },
        },
      },
    });

    return conversacion;
  }

  // Enviar mensaje a una conversación
  async enviarMensaje(
    id_conversacion: number,
    dto: SendMensajeDto,
    id_usuario: number,
  ) {
    // Verificar que la conversación existe
    const conversacion = await this.prisma.chat_conversacion.findUnique({
      where: { id_conversacion },
    });

    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada');
    }

    // Verificar permisos: debe ser el dueño o un admin/root
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      select: { tipo_usuario: true },
    });

    const esAdmin =
      usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'root';
    const esDueno = conversacion.id_usuarioFK === id_usuario;

    if (!esAdmin && !esDueno) {
      throw new ForbiddenException(
        'No tienes permiso para enviar mensajes en esta conversación',
      );
    }

    // Verificar que la conversación esté abierta
    if (conversacion.estado === 'cerrado') {
      throw new ForbiddenException('Esta conversación está cerrada');
    }

    // Crear el mensaje
    const mensaje = await this.prisma.chat_mensaje.create({
      data: {
        contenido: dto.contenido,
        id_conversacionFK: id_conversacion,
        id_autorFK: id_usuario,
      },
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
      },
    });

    // Actualizar la fecha de actualización de la conversación
    await this.prisma.chat_conversacion.update({
      where: { id_conversacion },
      data: { actualizado_en: new Date() },
    });

    return mensaje;
  }

  // Obtener conversaciones del usuario (clientes ven solo las suyas)
  async getMisConversaciones(id_usuario: number) {
    return this.prisma.chat_conversacion.findMany({
      where: { id_usuarioFK: id_usuario },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
          },
        },
        mensajes: {
          orderBy: { creado_en: 'desc' },
          take: 1, // Solo el último mensaje para preview
          include: {
            autor: {
              select: {
                id_usuario: true,
                nombre: true,
                tipo_usuario: true,
              },
            },
          },
        },
        _count: {
          select: {
            mensajes: {
              where: {
                leido: false,
                NOT: { id_autorFK: id_usuario }, // Mensajes no leídos que no son del usuario
              },
            },
          },
        },
      },
      orderBy: { actualizado_en: 'desc' },
    });
  }

  // Obtener todas las conversaciones (solo admin/root)
  async getTodasLasConversaciones() {
    return this.prisma.chat_conversacion.findMany({
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
          },
        },
        mensajes: {
          orderBy: { creado_en: 'desc' },
          take: 1,
          include: {
            autor: {
              select: {
                id_usuario: true,
                nombre: true,
                tipo_usuario: true,
              },
            },
          },
        },
        _count: {
          select: {
            mensajes: {
              where: { leido: false },
            },
          },
        },
      },
      orderBy: { actualizado_en: 'desc' },
    });
  }

  // Obtener detalle de una conversación con todos los mensajes
  async getConversacion(id_conversacion: number, id_usuario: number) {
    const conversacion = await this.prisma.chat_conversacion.findUnique({
      where: { id_conversacion },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            username: true,
            img_url: true,
          },
        },
        mensajes: {
          orderBy: { creado_en: 'asc' },
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
          },
        },
      },
    });

    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada');
    }

    // Verificar permisos
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      select: { tipo_usuario: true },
    });

    const esAdmin =
      usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'root';
    const esDueno = conversacion.id_usuarioFK === id_usuario;

    if (!esAdmin && !esDueno) {
      throw new ForbiddenException(
        'No tienes permiso para ver esta conversación',
      );
    }

    // Marcar mensajes como leídos (los que no son del usuario actual)
    await this.prisma.chat_mensaje.updateMany({
      where: {
        id_conversacionFK: id_conversacion,
        NOT: { id_autorFK: id_usuario },
        leido: false,
      },
      data: { leido: true },
    });

    return conversacion;
  }

  // Cerrar conversación (solo admin/root)
  async cerrarConversacion(id_conversacion: number) {
    const conversacion = await this.prisma.chat_conversacion.findUnique({
      where: { id_conversacion },
    });

    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada');
    }

    return this.prisma.chat_conversacion.update({
      where: { id_conversacion },
      data: { estado: 'cerrado' },
    });
  }

  // Reabrir conversación (solo admin/root)
  async reabrirConversacion(id_conversacion: number) {
    const conversacion = await this.prisma.chat_conversacion.findUnique({
      where: { id_conversacion },
    });

    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada');
    }

    return this.prisma.chat_conversacion.update({
      where: { id_conversacion },
      data: { estado: 'abierto' },
    });
  }
}
