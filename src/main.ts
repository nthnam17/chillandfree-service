import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as serveStatic from 'serve-static';
import { join } from 'path';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Data Labeling example')
        .setDescription('Data Labeling API description')
        .setVersion('1.0')
        .addTag('Data Labeling')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const whitelist = (process.env.CORS_WHITELIST || '').split(',').map((item) => item.trim());
    app.enableCors({
        origin: function (origin, callback) {
            if (!origin || whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.log('blocked cors for:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization, X-Channel, Access-Control-Allow-Origin',
        methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
        credentials: true,
    });

    // Cấu hình để phục vụ các file tĩnh từ thư mục 'uploads'
    app.use('/uploads', serveStatic(join(__dirname, '..', 'uploads')));

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    await app.listen(8080);
}
bootstrap();
