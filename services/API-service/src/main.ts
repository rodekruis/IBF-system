import { PORT, SCHEME } from './config';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
    const appOptions = { cors: true };
    const app = await NestFactory.create(ApplicationModule, appOptions);
    app.setGlobalPrefix('api');

    const options = new DocumentBuilder()
        .setTitle('IBF - API-service')
        .setDescription('API description')
        .setVersion('1.0')
        .addServer(`${SCHEME}://`)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/docs', app, document);
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT || PORT);
}
bootstrap();
