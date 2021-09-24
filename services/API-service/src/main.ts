import { PORT, SCHEME } from './config';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const appOptions = { cors: true };
  const app = await NestFactory.create(ApplicationModule, appOptions);
  const apiVersion = '1.0';
  const apiDocumentationTitle = 'IBF API Documentation';
  const apiDocumentationFavicon =
    'https://www.510.global/wp-content/uploads/2017/09/cropped-510-FLAVICON-01-32x32.png';
  const apiDocumentationDescription =
    'This page serves as the documentation of IBF API endpoints, and can also be used for executing endpoints.<br>To get access:<ul><li>If you have an account, use the `/api/user/login` endpoint below to get a token and copy-paste it in the `Authorize` button on the top right of this page.</li><li>If you do not have an account, contact the IBF Development Team.</li><li>Verify your access by using the `check API` endpoints below</li></ul>';

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle(apiDocumentationTitle)
    .setDescription(apiDocumentationDescription)
    .setVersion(apiVersion)
    .addServer(`${SCHEME}://`)
    .addBearerAuth()
    .build();
  const swaggerDocumentOptions: SwaggerDocumentOptions = {
    ignoreGlobalPrefix: false,
  };
  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 9,
      deepLinking: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: apiDocumentationTitle,
    customfavIcon: apiDocumentationFavicon,
  };
  const document = SwaggerModule.createDocument(
    app,
    config,
    swaggerDocumentOptions,
  );
  SwaggerModule.setup('/docs', app, document, swaggerCustomOptions);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || PORT);
}
bootstrap();
