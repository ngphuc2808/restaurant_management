import { NestFactory, Reflector } from '@nestjs/core';
import {
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';

import { AppModule } from '@/app.module';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { TransformInterceptor } from '@/core/transform.interceptor';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector);
  const i18nService = app.get<I18nService>(I18nService);

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector, i18nService));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new UnprocessableEntityException({
          message: 'Lỗi xảy ra khi xác thực dữ liệu...',
          errors: validationErrors.map((error) => ({
            field: error.property,
            message: Object.values(error.constraints).join(', '),
          })),
        });
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.enableCors({
    origin: [
      configService.get('CLIENT_PUBLIC_URL'),
      configService.get('CLIENT_PUBLIC_IP'),
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api-server');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('API Document')
    .setDescription('All Modules Api')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(configService.get('PORT'));

  console.log(`Server is running on port ${configService.get('PORT')}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
