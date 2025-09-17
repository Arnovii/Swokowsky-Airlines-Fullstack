import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FlightsModule } from './modules/flights/flights.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que esté disponible en toda la app
    }),
    DatabaseModule,
    AuthModule,
    FlightsModule,
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
