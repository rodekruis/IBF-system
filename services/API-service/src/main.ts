import { PORT, SCHEME } from './config';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap(): Promise<void> {
  const appOptions = { cors: true };
  const app = await NestFactory.create(ApplicationModule, appOptions);
  const apiVersion = '1.0';
  const apiDocumentationTitle = 'IBF API Documentation';
  const apiDocumentationFavicon =
    'https://www.510.global/wp-content/uploads/2017/09/cropped-510-FLAVICON-01-32x32.png';
  const apiDocumentationDescription =
    'This page serves as the documentation of IBF API endpoints, and can also be used for executing API-calls.<br>To get access:<ul><li>If you have an account:<ul><li>use the `/api/user/login` endpoint below</li><li>click `Try it out`, fill in your username and password, and click `Execute`</li><li>copy the resulting `token`-attribute and paste it in the `Authorize` button on the top right of this page.</li></ul></li><li>If you do not have an account, contact the IBF Development Team.</li><li>You can verify your access by using the `check API` endpoints below:<ul><li>`/api` works (also without authenticaition) as long as the API itself works</li><li>`/api/authentication` only works if you have successfully authorized</li></ul></li></ul>';

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle(apiDocumentationTitle)
    .setDescription(apiDocumentationDescription)
    .setVersion(apiVersion)
    .addServer(SCHEME)
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
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: errors => new BadRequestException(errors),
    }),
  );
  app.use(bodyParser.json({ limit: '25mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '25mb',
      extended: true,
    }),
  );
  await app.listen(process.env.PORT || PORT);
}
bootstrap();
