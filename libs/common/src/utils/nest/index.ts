import { HttpExceptionsFilter } from '@app/common/filters';
import { VisitorIdGuard } from '@app/common/guards';
import {
  ClsUserSessionInterceptor,
  HttpLoggingInterceptor,
  HttpResponseInterceptor,
} from '@app/common/interceptors';
import { validationPipe } from '@app/common/pipes';
import { ClsContextService } from '@app/common/services';
import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { getConfig } from '../config';

export interface SetupBootstrapOptions {
  swaggerTitle?: string;
  swaggerDescription?: string;
  swaggerVersion?: string;
  swaggerPath?: string;
  listenPort?: number;
  listenHost?: string;
  logLevel?: 'debug' | 'verbose' | 'error' | 'warn' | 'log';
}

export async function setupBootstrap(
  app: INestApplication<any>,
  options: SetupBootstrapOptions = {},
) {
  const logger = new Logger('bootstrap');
  // Enable Shutdown hooks
  app.enableShutdownHooks();
  app.enableCors();

  const timeZone = getConfig('core.defaultTimeZone', 'Asia/Bangkok');

  process.env.TZ = timeZone;

  const d = new Date().toTimeString();

  logger.verbose(`Current UTC TimeZone ${timeZone}: ${d}`);

  // Use Global Guard
  app.useGlobalGuards(new VisitorIdGuard(app.get(Reflector)));

  // Use Global Interceptor
  app.useGlobalInterceptors(
    new ClsUserSessionInterceptor(app.get(ClsContextService)),
    new ClassSerializerInterceptor(app.get(Reflector)),
    new HttpResponseInterceptor(),
    HttpLoggingInterceptor({ logLevel: options.logLevel ?? 'debug' }),
  );

  // Use Global Filters
  app.useGlobalFilters(new HttpExceptionsFilter());

  // Use Global Pipes
  app.useGlobalPipes(validationPipe);

  // Enable Swagger
  const documentConfig = new DocumentBuilder()
    .setTitle(options.swaggerTitle ?? 'API')
    .setDescription(options.swaggerDescription ?? 'API docs')
    .setVersion(options.swaggerVersion ?? '1.0')
    .addBearerAuth()
    .addGlobalParameters({
      name: 'x-visitor-id',
      in: 'header',
      schema: { type: 'string', example: 'swagger-document-visitor' },
    })
    .build();

  const appName = getConfig('appName');
  const swaggerPath = options.swaggerPath ?? `/api/${appName}/docs`;
  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup(swaggerPath, app, documentFactory);

  // Connect Microservices
  const initServices = getConfig<string[]>('core.gateway.initServices', []);
  for (const serviceId of initServices) {
    const serviceOptions = getConfig<MicroserviceOptions>(
      'core.gateway.services.' + serviceId,
    );
    app.connectMicroservice<MicroserviceOptions>(serviceOptions);
  }

  const port = options.listenPort ?? getConfig<number>('port');
  const host = options.listenHost ?? getConfig<string>('host', '0.0.0.0');

  await Promise.all([app.startAllMicroservices(), app.listen(port, host)]).then(
    async () => {
      const url = await app.getUrl();
      console.log(
        [
          `====================`,
          `Application is running on: ${url}`,
          `API Document on: ${url}${swaggerPath}`,
          `====================`,
        ].join('\n'),
      );
    },
  );
}
