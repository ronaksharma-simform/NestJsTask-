import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from './pipes/validationPipe.pipe';
import cookieParser from 'cookie-parser' 
import cors from 'cors'
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'verbose', 'log'],
  });
  app.use(cors({
    origin:'*',
    credentials:true,
    
  }))
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Social Media Application')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken', // The actual name of the cookie parsed by the server
    })
    .setDescription('Social Media Application process')
    .setVersion('1.0')
    .addTag('Social Media Application')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
