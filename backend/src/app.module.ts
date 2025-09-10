import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { FlightsModule } from './modules/flights/flights.module';

@Module({
  imports: [AuthModule, FlightsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
