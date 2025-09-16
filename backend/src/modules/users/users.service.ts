import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../database/prisma.service';
import { usuario, usuario_tipo_usuario } from '@prisma/client';




@Injectable()
export class UsersService {
  //Importamos Prisma para interactuar con la DB
  //private --> solo accesible por medio de esta clase
  //readonly --> no modificable una vez inicializado
  constructor(private readonly prisma: PrismaService) { }



  async findAllUsers(): Promise<usuario[]> {
    try {
      const usersList: usuario[] = await this.prisma.usuario.findMany();
      return usersList;
    } catch (error) {
      throw new BadRequestException(`Hubo un problema al obtener la lista de usuarios. Por favor, intente nuevamente más tarde.${error}`);
    }
  }

  //Nunca va a retornar Promise<null> gracias a la condición de if(!user), en su lugar, lanzará un error. 
  async getUserByID(id: number): Promise<usuario | null> {
    try {
      if (isNaN(id)) throw new BadRequestException('El ID debe ser un número');    //Validamos que el id sean caracteres numéricos
      const user: usuario | null = await this.prisma.usuario.findUnique({ where: { id_usuario: id } })
      if (!user) throw new Error(`El usuario #${id} no existe en la base de datos`) //Si es null, no existe el usuario. 
      return user
    } catch (error) {
      throw new BadRequestException(`Hubo un problema al obtener la información del usuario. Por favor, intente nuevamente más tarde.${error}`);
    }
  }

  async createUser(data: CreateUserDto): Promise<usuario> {
    try {
      //El backend define estos valores, el cliente no puede enviarlos
      const userCreated = await this.prisma.usuario.create({
        data: {
          ...data,
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

      // ✅ Verificamos que exista antes de actualizar
      const existingUser = await this.prisma.usuario.findUnique({
        where: { id_usuario: id },
      });

      if (!existingUser) {
        throw new BadRequestException(`El usuario #${id} no existe.`);
      }

      // 🛑 Remover campos que no queremos que el cliente modifique
      console.log(data);

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
