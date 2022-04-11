import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { AllExceptionsFilter } from './all-exceptions.filter';
import { AllResponsesInterceptor } from './all-responses.interceptor';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    /*
      TODO:
      Configure nest so it reads .env files,
      and configure url of frontend inside this file.
    */
    origin: 'http://localhost:3000',
  });

  console.log('env', process.env.NODE_ENV);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new AllResponsesInterceptor());

  await app.listen(3001);
};

bootstrap();
