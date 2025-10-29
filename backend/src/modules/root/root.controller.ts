import { Controller, Post, Body, Param, ForbiddenException } from '@nestjs/common';
import { RootService } from './root.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('root')
export class RootController {
  constructor(private readonly rootService: RootService) {}

  // POST /root/:idRoot/admin
  @Post(':idRoot/admin')
  createAdmin(
    @Param('idRoot') idRoot: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.rootService.createAdmin(+idRoot, createUserDto);
  }
}
