import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = ['https://resume-boost-iota.vercel.app'];

  app.enableCors({
    origin: (origin, callback) => {
      // Normalize by stripping trailing slash before comparing
      const normalized = origin ? origin.replace(/\/$/, '') : '';
      if (!origin || allowedOrigins.includes(normalized)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
