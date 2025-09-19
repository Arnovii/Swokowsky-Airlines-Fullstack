import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  //Ejecutar las validaciones realizadas en los DTO's
  app.useGlobalPipes(
    new ValidationPipe({
      //Tirar error si el usuario envía datos que no correspondan, lanzar error.
      whitelist: true,
      forbidNonWhitelisted: true,
      // Parsea en el controlador al tipo de dato que definamos en el parámetro (los querys siempre llegan como strings)
      transform: true,
    })
  );

  //Hacemos el AuthGuard global
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(new AuthGuard(jwtService, reflector));



  await app.listen(process.env.PORT ?? 3000);
} 
bootstrap();
