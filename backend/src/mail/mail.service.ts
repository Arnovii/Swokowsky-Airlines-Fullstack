import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { resolve } from 'path';
import { PrismaService } from '../database/prisma.service';

type MailOptions = {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  text?: string;
};

type BulkOptions = {
  concurrency?: number; // cantidad de correos en paralelo dentro de cada chunk
  delayBetweenChunksMs?: number; // pausa entre chunks para evitar rate limits
  awaitAll?: boolean; // si true espera a que terminen todos antes de retornar
};

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService,
      private readonly prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('EMAIL_HOST'),
      port: Number(config.get<string>('EMAIL_PORT')),
      secure: config.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: config.get<string>('EMAIL_USER'),
        pass: config.get<string>('EMAIL_PASS'),
      },
    });

    // Configuración de plantillas Handlebars
    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          partialsDir: resolve(__dirname, 'templates'),
          defaultLayout: false,
        },
        viewPath: resolve(__dirname, 'templates'),
        extName: '.hbs',
      }),
    );
  }

  // envío atómico 1:1 (ya existente)
  async sendMail({ to, subject, template, context, text }: MailOptions) {
    const from = this.config.get<string>('EMAIL_FROM');
    const mailOptions: any = { from, to, subject, template, context, text };
    return await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(to: string, data: { name: string; username?: string }) {
    return this.sendMail({
      to,
      subject: 'Bienvenido a Swokowsky Airlines',
      template: 'welcome',
      context: data,
    });
  }

  async sendAdminWelcomeEmail(to: string, data: { name: string; loginLink: string; temporalPassword: string; }) {
    return this.sendMail({
      to,
      subject: 'Activación de cuenta - Swokowsky Airlines',
      template: 'admin-welcome',
      context: data,
    });
  }


  async sendResetPasswordEmail(to: string, data: { name: string; resetLink: string }) {
    return this.sendMail({
      to,
      subject: 'Recuperación de contraseña - Swokowsky Airlines',
      template: 'reset-password',
      context: data,
    });
  }

  async sendNewNotificationEmail(
    to: string,
    data: {
      titulo: string;
      descripcion_corta: string;
      descripcion_larga: string;
      precio_economica: string;
      precio_primera: string;
      fecha_hora_salida: string;
      fecha_hora_llegada: string;
      bannerImageUrl: string;
      estado?: string;
      promocion?: { nombre: string; descripcion: string; descuento: number; fecha_inicio: string; fecha_fin: string; periodo_lectura: string; } | null;
      frontendUrl?: string;
      newsId?: string | number;
    },
  ) {
    return this.sendMail({
      to,
      subject: 'Tenemos novedades para ti — Swokowsky Airlines ✈️',
      template: 'new-notification',
      context: {
        titulo: data.titulo,
        descripcion_corta: data.descripcion_corta,
        descripcion_larga: data.descripcion_larga,
        precio_economica: data.precio_economica,
        precio_primera: data.precio_primera,
        fecha_hora_salida: data.fecha_hora_salida,
        fecha_hora_llegada: data.fecha_hora_llegada,
        bannerImageUrl: data.bannerImageUrl,
        estado: data.estado ?? 'Programado',
        promocion: data.promocion ?? null,
        frontendUrl: data.frontendUrl ?? process.env.FRONTEND_URL,
        newsId: data.newsId ?? '',
      },
    });
  }

  async sendTicketEmail(
    to: string,
    data: { nombre: string; TituloNoticiaVuelo: string; NumeroAsiento: string, CategoriaAsiento: string, CodigoCheckin?: string }
  ) {
    // Extraer el número real del vuelo: "Vuelo #1234" => 1234
    const idVueloRaw = data.TituloNoticiaVuelo;
    const vueloId = Number(idVueloRaw.split('#')[1]?.trim());

    if (isNaN(vueloId)) {
      throw new Error(`El ID de vuelo no es válido: ${idVueloRaw}`);
    }

    // Buscar en la BD información del vuelo + aeropuertos + ciudades
    const vuelo = await this.prisma.vuelo.findUnique({
      where: { id_vuelo: vueloId },
      include: {
        aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
          include: { ciudad: true },
        },
        aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
          include: { ciudad: true },
        },
      },
    });

    if (!vuelo) {
      throw new Error(`No se encontró el vuelo con ID ${vueloId}`);
    }

    // Origen
    const origen = vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto;
    const ciudadOrigen = origen.ciudad.nombre;

    // Destino
    const destino = vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto;
    const ciudadDestino = destino.ciudad.nombre;

    // Cambiar el título para el correo
    data.TituloNoticiaVuelo = `${ciudadOrigen} ➡ ${ciudadDestino}`;

    // Debug: log para verificar que el código de check-in se está pasando
    this.logger.log(`📧 Enviando email a ${to} con código de check-in: ${data.CodigoCheckin || 'NO INCLUIDO'}`);

    return this.sendMail({
      to,
      subject: 'Confirmación de Ticket - Swokowsky Airlines',
      template: 'ticket-confirmation',
      context: data,
    });
  }


  /**
   * Envía una notificación (plantilla new-notification) a múltiples destinatarios.
   * Usa internamente sendNewNotificationEmail para cada email.
   * Devuelve resumen { total, sent, failed, errors }.
   */
  async sendBulkNotifications(
    recipients: string[],
    context: {
      titulo: string;
      descripcion_corta: string;
      descripcion_larga: string;
      precio_economica: string;
      precio_primera: string;
      fecha_hora_salida: string;
      fecha_hora_llegada: string;
      bannerImageUrl: string;
      estado?: string;
      promocion?: { nombre: string; descripcion: string; descuento: number; fecha_inicio: string; fecha_fin: string; periodo_lectura: string; } | null;
      frontendUrl?: string;
      newsId?: string | number;
    },
    options: BulkOptions = {},
  ) {
    const concurrency = options.concurrency ?? 10;
    const delayBetweenChunksMs = options.delayBetweenChunksMs ?? 200;
    const awaitAll = options.awaitAll ?? false;

    if (!recipients || recipients.length === 0) {
      this.logger.log('sendBulkNotifications: no recipients provided');
      return { total: 0, sent: 0, failed: 0, errors: [] as any[] };
    }

    // Prepare chunks
    const chunks: string[][] = [];
    for (let i = 0; i < recipients.length; i += concurrency) {
      chunks.push(recipients.slice(i, i + concurrency));
    }

    let sent = 0;
    let failed = 0;
    const errors: Array<{ to: string; error: string }> = [];

    // Ejecutar cada chunk secuencialmente para evitar picos (pero cada chunk envía en paralelo)
    const chunkPromises: Promise<void>[] = [];

    for (const chunk of chunks) {
      const promises = chunk.map(async (email) => {
        try {
          await this.sendNewNotificationEmail(email, {
            titulo: context.titulo,
            descripcion_corta: context.descripcion_corta,
            descripcion_larga: context.descripcion_larga,
            precio_economica: context.precio_economica,
            precio_primera: context.precio_primera,
            fecha_hora_salida: context.fecha_hora_salida,
            fecha_hora_llegada: context.fecha_hora_llegada,
            bannerImageUrl: context.bannerImageUrl,
            estado: context.estado,
            promocion: context.promocion,
            frontendUrl: context.frontendUrl ?? process.env.FRONTEND_URL,
            newsId: context.newsId ?? '',
          });
          sent++;
        } catch (err: any) {
          failed++;
          const msg = err?.message ?? String(err);
          errors.push({ to: email, error: msg });
          this.logger.warn(`Failed to send notification to ${email}: ${msg}`);
        }
      });

      const group = Promise.all(promises).then(() => void 0);
      chunkPromises.push(group);

      // Espera entre chunks para no saturar (si se desea un throttle estrictamente)
      if (delayBetweenChunksMs > 0) {
        // Si awaitAll=false no hace "await chunk" aquí para no bloquear la respuesta, pero
        // hacemos un breve sleep para espaciar la creación de promesas (control de memoria)
        // y evitar picos instantáneos.
        await new Promise((res) => setTimeout(res, delayBetweenChunksMs));
      }
    }

    if (awaitAll) {
      // Espera a que terminen todos
      await Promise.all(chunkPromises);
      this.logger.log(`sendBulkNotifications finished: total=${recipients.length} sent=${sent} failed=${failed}`);
    } else {
      // Fire-and-forget: lanzamos en background y retornamos inmediatamente.
      Promise.all(chunkPromises)
        .then(() => {
          this.logger.log(`sendBulkNotifications background finished: total=${recipients.length} sent=${sent} failed=${failed}`);
        })
        .catch((err) => {
          this.logger.error('sendBulkNotifications background error: ' + String(err));
        });
    }

    return { total: recipients.length, sent, failed, errors };
  }
}
