import fs from 'fs';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import * as bodyParser from 'body-parser';
import { SpelunkerModule } from 'nestjs-spelunker';

import { ApplicationModule } from './app.module';
import { DEBUG, EXTERNAL_API, PORT } from './config';

/**
 * A visualization of module dependencies is generated using `nestjs-spelunker`
 * The file can be vied with [Mermaid](https://mermaid.live) or the VSCode extention "bierner.markdown-mermaid"
 * See: https://github.com/jmcdo29/nestjs-spelunker
 */
function generateModuleDependencyGraph(app: INestApplication): void {
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  const genericModules = [
    // Sorted alphabetically
    'ApplicationModule',
    'HealthModule',
    'HttpModule',
    'ScheduleModule',
    'ScriptsModule',
    'TerminusModule',
    'TypeOrmCoreModule',
    'TypeOrmModule',
  ];
  const mermaidEdges = edges
    .filter(
      ({ from, to }) =>
        !genericModules.includes(from.module.name) &&
        !genericModules.includes(to.module.name),
    )
    .map(({ from, to }) => `  ${from.module.name}-->${to.module.name}`);
  const mermaidGraph =
    '# Module Dependencies Graph\n\n```mermaid\ngraph LR\n' +
    mermaidEdges.join('\n') +
    '\n```\n';

  fs.writeFile('module-dependencies.md', mermaidGraph, 'utf8', (err) => {
    if (err) console.warn(`Writing API-graph failed!`, err);
  });
}

async function bootstrap(): Promise<void> {
  const appOptions = { cors: true };
  const app = await NestFactory.create(ApplicationModule, appOptions);
  const apiVersion = '1.0';
  const apiDocumentationTitle = 'IBF API Documentation';
  const apiDocumentationFavicon =
    'https://www.510.global/wp-content/uploads/2017/09/cropped-510-FLAVICON-01-32x32.png';
  const apiDocumentationDescription =
    'This page serves as the documentation of IBF API endpoints, and can also be used for executing API-calls.<br>To get access:<ul><li>If you have an account:<ul><li>use the `/api/user/login` endpoint below</li><li>click `Try it out`, fill in your email and password, and click `Execute`</li><li>copy the resulting `token`-attribute and paste it in the `Authorize` button on the top right of this page.</li></ul></li><li>If you do not have an account, contact the IBF Development Team.</li><li>You can verify your access by using the `check API` endpoints below:<ul><li>`/api` works (also without authenticaition) as long as the API itself works</li><li>`/api/authentication` only works if you have successfully authorized</li></ul></li></ul>';

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle(apiDocumentationTitle)
    .setDescription(apiDocumentationDescription)
    .setVersion(apiVersion)
    .addServer(EXTERNAL_API.root)
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
      forbidUnknownValues: false,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  app.use(bodyParser.json({ limit: '25mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '25mb',
      extended: true,
    }),
  );

  if (DEBUG) {
    generateModuleDependencyGraph(app);
  }

  await app.listen(process.env.PORT || PORT);
}
bootstrap();
