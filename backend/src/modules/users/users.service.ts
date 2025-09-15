import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class UsersService {
  //Importamos Prisma para interactuar con la DB
  //private --> solo accesible por medio de esta clase
  //readonly --> no modificable una vez inicializado
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany();
  }

  create(createUserDto: CreateUserDto) {
    
    return 'This action adds a new user';
  }


  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
