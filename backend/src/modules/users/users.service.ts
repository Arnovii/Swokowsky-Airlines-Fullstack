import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../database/prisma.service';
import { usuario, usuario_tipo_usuario } from '@prisma/client';
import * as bcryptjs from 'bcryptjs'




@Injectable()
export class UsersService {
  //Importamos Prisma para interactuar con la DB
  //private --> solo accesible por medio de esta clase
  //readonly --> no modificable una vez inicializado
  constructor(private readonly prisma: PrismaService) { }



  async getAllUsers(): Promise<usuario[]> {
    try {
      const usersList: usuario[] = await this.prisma.usuario.findMany();
      return usersList;
    } catch (error) {
      throw new BadRequestException(`Hubo un problema al obtener la lista de usuarios. Por favor, intente nuevamente más tarde.${error}`);
    }
  }

  //Nunca va a retornar Promise<null> gracias a la condición de if(!user), en su lugar, lanzará un error. 
  async getUserByID(id: number): Promise<usuario> {
    try {
      if (isNaN(id)) throw new BadRequestException('El ID debe ser un número');    //Validamos que el id sean caracteres numéricos
      const user: usuario | null = await this.prisma.usuario.findUnique({ where: { id_usuario: id } })
      if (!user) throw new Error(`El usuario #${id} no existe en la base de datos`) //Si es null, no existe el usuario. 
      return user
    } catch (error) {
      throw new BadRequestException(`Hubo un problema al obtener la información del usuario. Por favor, intente nuevamente más tarde.${error}`);
    }
  }

  // GET --> útil en endpoints como GET, ya que lanza un error al no encontrar (Para endpoints que requieren que el usuario exista (lanzan error si no existe)
  async getUserByEmail(email: string): Promise<usuario | null> {
    try {
      if (!email || email.trim() === '') {
        throw new BadRequestException('El email no puede estar vacío');
      }

      const user: usuario | null = await this.prisma.usuario.findUnique({
        where: { correo: email },
      });

      if (!user) {
        throw new Error(`No existe ningún usuario con el email ${email}`);
      }

      return user;
    } catch (error) {
      throw new BadRequestException(
        `Hubo un problema al obtener la información del usuario por email. Detalle: ${error}`,
      );
    }
  }

  // GET --> útil en endpoints como GET, ya que lanza un error al no encontrar (Para endpoints que requieren que el usuario exista (lanzan error si no existe)
  async getUserByUsername(username: string): Promise<usuario | null> {
    try {
      if (!username || username.trim() === '') {
        throw new BadRequestException('El username no puede estar vacío');
      }

      const user: usuario | null = await this.prisma.usuario.findUnique({
        where: { username: username },
      });

      if (!user) {
        throw new Error(`No existe ningún usuario con el username ${username}`);
      }

      return user;
    } catch (error) {
      throw new BadRequestException(
        `Hubo un problema al obtener la información del usuario por username. Detalle: ${error}`,
      );
    }
  }
  // FIND --> Para validaciones lógicas donde null es un resultado esperado (funcion de register en Auth por ejemplo.)
  async findUserByEmail(email: string): Promise<usuario | null> {
    if (!email || email.trim() === '') return null;

    return this.prisma.usuario.findUnique({
      where: { correo: email },
    });
  }

  // FIND --> Para validaciones lógicas donde null es un resultado esperado (funcion de register en Auth por ejemplo.)
  async findUserByUsername(username: string): Promise<usuario | null> {
    if (!username || username.trim() === '') return null;

    return this.prisma.usuario.findUnique({
      where: { username:username },
    });
  }


  async createUser(data: CreateUserDto): Promise<usuario> {
    try {

      const userCreated = await this.prisma.usuario.create({
        data: {
          ...data,
          //El backend define estos valores, el cliente no debería de enviarlos al momento de crearse  
          direccion_facturacion: "",
          suscrito_noticias: false,
          tipo_usuario: usuario_tipo_usuario.cliente,
          creado_en: new Date(),
        },
      });

      return userCreated;
    } catch (error) {
      throw new BadRequestException(
        `Hubo un problema al crear el usuario. Por favor, intente nuevamente. ${error}`,
      );
    }
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<usuario> {
    try {
      if (isNaN(id)) throw new BadRequestException('El ID debe ser un número');

      //Verificamos que exista antes de actualizar
      const existingUser = await this.prisma.usuario.findUnique({
        where: { id_usuario: id },
      });

      if (!existingUser) {
        throw new BadRequestException(`El usuario #${id} no existe.`);
      }
      
      const updatedUser = await this.prisma.usuario.update({
        where: { id_usuario: id },
        data: data
      });

      return updatedUser;
    } catch (error) {
      throw new BadRequestException(
        `Hubo un problema al actualizar el usuario. ${error}`,
      );
    }
  }


}
