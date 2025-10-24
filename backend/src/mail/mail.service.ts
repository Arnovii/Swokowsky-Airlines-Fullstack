import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { resolve } from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('EMAIL_HOST'),
      port: Number(config.get<string>('EMAIL_PORT')),
      secure: config.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: config.get<string>('EMAIL_USER'),
        pass: config.get<string>('EMAIL_PASS'),
      },
    });

    // Configuración de plantillas handlebars
    this.transporter.use('compile', hbs({
      viewEngine: {
        extname: '.hbs',
        partialsDir: resolve(__dirname, 'templates'),
        defaultLayout: false,
      },
      viewPath: resolve(__dirname, 'templates'),
      extName: '.hbs',
    }));
  }

  async sendMail({ to, subject, template, context, text }: {
    to: string;
    subject: string;
    template?: string;
    context?: Record<string, any>;
    text?: string;
  }) {
    const from = this.config.get<string>('EMAIL_FROM');
    const mailOptions: any = {
      from,
      to,
      subject,
      template,
      context,
      text,
    };
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

  async sedNewNotificationEmail(to:string, data: {}){
    return this.sendMail({
      to,
      subject:'Tenemos novedades para ti',
      template: 'new-notification',
      context: data
    })

  }

  async sendResetPasswordEmail(to: string, data: { name: string; resetLink: string }) {
    return this.sendMail({
      to,
      subject: 'Recuperación de contraseña - Swokowsky Airlines',
      template: 'reset-password',
      context: data,
    });
  }
}
