import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './common/guards/auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:  'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

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

  //Swagger
      const config = new DocumentBuilder()
      .setTitle('Swokosky Airlines API')
      .setDescription('Documentación de la API de Swokosky Airlines')
      .setVersion('1.0')
      // => aquí definimos el esquema Bearer (JWT)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header'
        },
        'bearerAuth' // <-- nombre del esquema, usar este ID en @ApiBearerAuth(...)
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true } // mantiene token entre reloads
    });

    console.log('Swagger disponible en: /api/docs');


  await app.listen(process.env.PORT ?? 3000);
} 
bootstrap();
