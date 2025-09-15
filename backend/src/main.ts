import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
