import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './modules/profile/profile.module';
import { MailModule } from './mail/mail.module';
import { NewsModule } from './modules/news/news.module';
import { FlightsModule } from './modules/flights/flights.module';
import { CitysModule } from './modules/citys/citys.module';
import { AirplanesModule } from './modules/airplanes/airplanes.module';
import { AirportsModule } from './modules/airports/airports.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que esté disponible en toda la app
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    FlightsModule,
    ProfileModule,
    MailModule,
    NewsModule,
    CitysModule,
    AirplanesModule,
    AirportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
