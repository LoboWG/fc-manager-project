import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config'; // <-- Importer ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // On récupère une instance du ConfigService une fois l'app créée
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  app.use(
    session({
      // On utilise le ConfigService pour récupérer le secret du .env
      secret: configService.get('SESSION_SECRET')!,
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 3600000 * 24,
        sameSite: 'lax'
       },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();