import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { EventsModule } from './events/events.module';

import config from './config';

const createAppModuleConfig = () => {
  const { ENVIRONMENT, SQLITE_DATABASE } = config;

  const ormConfigByEnvironment: {
    [key in typeof ENVIRONMENT]: Omit<SqliteConnectionOptions, 'type'>;
  } = {
    test: {
      database: SQLITE_DATABASE,
      logging: false,
      synchronize: true,
    },

    development: {
      database: SQLITE_DATABASE,
      logging: true,
      synchronize: true,
    },

    production: {
      database: SQLITE_DATABASE,
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
    ...ormConfigByEnvironment[ENVIRONMENT],
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
@Module(createAppModuleConfig())
export class AppModule {}
