import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
    return this.usersService.getAllUsers();
  }

  //A pesar de que el query siempre se reciba como una string, gracias a el transform:true en el archivo main.ts, la conversión se hace automaticamente y podemos tiparlo como 'number'
  @Get(':username')
  getOne(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

}
