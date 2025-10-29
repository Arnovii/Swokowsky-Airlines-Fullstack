import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RootService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly mailService: MailService,
  private readonly jwtService: JwtService, 
) {}


  async createAdmin(idRoot: number, dto: CreateUserDto) {
    // 1️⃣ Verificar si el usuario que ejecuta la acción es ROOT
    const root = await this.prisma.usuario.findUnique({
      where: { id_usuario: idRoot },
    });

    if (!root || root.tipo_usuario !== 'root') {
      throw new ForbiddenException('No tienes permisos para crear administradores');
    }

    // 2️⃣ Hashear la contraseña inicial
    const hashedPassword = await bcrypt.hash(dto.password_bash, 10);

    // 3️⃣ Crear el usuario tipo ADMIN con el flag "must_change_password"
    const nuevoAdmin = await this.prisma.usuario.create({
      data: {
        dni: dto.dni,
        nombre: dto.nombre,
        apellido: dto.apellido,
        fecha_nacimiento: new Date(dto.fecha_nacimiento),
        nacionalidad: dto.nacionalidad,
        genero: dto.genero,
        correo: dto.correo,
        username: dto.username,
        password_bash: hashedPassword,
        img_url: dto.img_url,
        tipo_usuario: 'admin',
        creado_en: new Date(),
        must_change_password: true,
        direccion_facturacion: 'No especificada',
      },
    });

    // 4️⃣ Generar token temporal de 1 hora para el cambio de contraseña
    const token = await this.jwtService.signAsync(
      { correo: nuevoAdmin.correo },
      { expiresIn: '1h' },
    );

    const resetLink = `https://tu-frontend.com/change-password?token=${token}`;

    // 5️⃣ Enviar correo usando tu MailService con plantilla
    await this.mailService.sendAdminWelcomeEmail(nuevoAdmin.correo, {
      name: nuevoAdmin.nombre,
      resetLink,
    });

    // 6️⃣ Responder al root con datos del nuevo admin
    return {
      message: 'Administrador creado exitosamente ✅',
      admin: {
        id_usuario: nuevoAdmin.id_usuario,
        nombre: nuevoAdmin.nombre,
        correo: nuevoAdmin.correo,
        must_change_password: nuevoAdmin.must_change_password,
      },
    };
  }
}
