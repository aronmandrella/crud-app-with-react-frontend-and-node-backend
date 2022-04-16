import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { AllExceptionsFilter } from './all-exceptions.filter';
import { AllResponsesInterceptor } from './all-responses.interceptor';

import config from './config';

const bootstrap = async () => {
  const { FRONTEND_URL, APP_PORT } = config;

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: FRONTEND_URL,
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new AllResponsesInterceptor());

  await app.listen(APP_PORT);
};

bootstrap();
