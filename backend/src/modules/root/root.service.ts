import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcryptjs from 'bcryptjs'
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { nationalities, usuario_genero, usuario_tipo_usuario } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { DeleteAdminDto } from './dto/detele-admin.dto';


@Injectable()
export class RootService {
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService // <-- para leer variables de entorno

  ) { }

  // Función para generar una contraseña aleatoria
  generateRandomPassword = (length: number = 8) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?"; // Caracteres posibles
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  async getAllAdmins() {
    return this.prisma.usuario.findMany({
      where: {
        tipo_usuario: usuario_tipo_usuario.admin,
      },
    });
  }

  async createAdmin(dto: CreateAdminDto) {

    //Verificaciones
    const userByEmail = await this.userService.findUserByEmail(dto.correo)
    if (userByEmail) throw new BadRequestException("Ya existe un administrador con ese correo.")

    const userByUsername = await this.userService.findUserByUsername(dto.username)
    if (userByUsername) throw new BadRequestException("Ya existe un administrador con ese username.")

    //Crear contraseña aleatoria
    const randomPassword = this.generateRandomPassword()

    //Hashear la contraseña inicial
    const hashedPassword = await bcryptjs.hash(randomPassword, 10);

    // Crear el usuario tipo ADMIN con el flag "must_change_password"
    const nuevoAdmin = await this.prisma.usuario.create({
      data: {
        tipo_usuario: usuario_tipo_usuario.admin,
        nombre: dto.nombre,
        apellido: dto.apellido,
        username: dto.username,
        correo: dto.correo,
        password_bash: hashedPassword,
        img_url: "https://res.cloudinary.com/dycqxw0aj/image/upload/v1758875237/uve00nxuv3cdyxldibkb.png",
        suscrito_noticias: false,
        creado_en: new Date(),
        must_change_password: true
        //Los demás datos son NULL, el administrador podrá agregarlos editando su perfil.
      },
    });


    const loginLink = `${this.configService.get<string>('FRONTEND_URL')}login`;

    // Enviar correo usando tu MailService con plantilla
    await this.mailService.sendAdminWelcomeEmail(nuevoAdmin.correo, {
      name: nuevoAdmin.nombre,
      loginLink: loginLink,
      temporalPassword: randomPassword
    });

    // Responder al root con datos del nuevo admin
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

  async deleteAdmin(dto: DeleteAdminDto) {
    const adminEmail = dto.correo;

    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: adminEmail },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con correo ${adminEmail} no encontrado.`);
    }

    if (usuario.tipo_usuario !== 'admin') {
      throw new Error('Este usuario no tiene el rol "admin", no puede ser eliminado.');
    }

    // Eliminar el usuario de la base de datos
    return this.prisma.usuario.delete({
      where: { correo:adminEmail },
    });
  }
}

