import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Get()
  getAll() {
    return this.usersService.findAllUsers();
  }

  //A pesar de que el query siempre se reciba como una string, gracias a el transform:true en el archivo main.ts, la conversión se hace automaticamente y podemos tiparlo como 'number'
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.getUserByID(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

}
