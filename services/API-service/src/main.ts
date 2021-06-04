import { PORT, SCHEME } from './config';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const appOptions = { cors: true };
  const app = await NestFactory.create(ApplicationModule, appOptions);
  const apiVersion = '1.0';
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('IBF API')
    .setDescription(
      'This page serves as the documentation of IBF API endpoints. Use the `/api/user/login` endpoint for the `Authorization Token` to access protected data.',
    )
    .setVersion(apiVersion)
    .addServer(`${SCHEME}://`)
    .addBearerAuth()
    .build();
  const options: SwaggerDocumentOptions = {};
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('/docs', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || PORT);
}
bootstrap();
