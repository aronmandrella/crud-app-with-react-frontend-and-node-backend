import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { EventsModule } from './events/events.module';

const createAppModuleClass = (config: {
  environment: 'development' | 'production' | 'test';
}) => {
  const { environment } = config;

  const ormConfigByEnvironment: {
    [key in typeof environment]: Omit<SqliteConnectionOptions, 'type'>;
  } = {
    test: {
      database: ':memory:',
      logging: false,
      synchronize: true,
    },

    development: {
      /*
        TODO:
        Configure nest so it reads .env files,
        and configure db path inside this file.
      */
      database: 'db.sqlite',
      logging: true,
      synchronize: true,
    },

    production: {
      /*
        TODO:
        Configure nest so it reads .env files,
        and configure db path inside this file.
      */
      database: 'db.sqlite',
      logging: false,
      /*
        NOTE:
        In a real world app it would be false.
        There would be migrations instead.
      */
      synchronize: true,
    },
  };

  const ormConfig: SqliteConnectionOptions = {
    type: 'sqlite',
    ...ormConfigByEnvironment[environment],
  };

  return {
    imports: [
      TypeOrmModule.forRoot({
        ...ormConfig,
        autoLoadEntities: true,
      }),
      EventsModule,
    ],
    controllers: [],
    providers: [],
  };
};
@Module(createAppModuleClass({ environment: 'development' }))
export class AppModule {}
@Module(createAppModuleClass({ environment: 'test' }))
export class TestAppModule {}
