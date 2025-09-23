import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './modules/profile/profile.module';
import { MailModule } from './mail/mail.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que esté disponible en toda la app
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
