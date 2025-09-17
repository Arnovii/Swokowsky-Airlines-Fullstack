import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  //Exporto para que el modulo de Auth pueda ser utilizado
  exports:[UsersService]
})
export class UsersModule {}
