import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

import { EventsModule } from './events/events.module';

const ormConfig: ConnectionOptions = {
  type: 'sqlite',

  /*
    TODO:
    Configure nest so it reads .env files,
    and configure db path inside this file.
  */
  database: 'db.sqlite',

  /*
    TODO:
    Configure nest so that it defines NODE_ENV,
    and set it to 'true' only in 'development' mode.
  */
  logging: true,

  /*
    NOTE:
    In a real world app it would be false.
    There would be migrations instead.
  */
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...ormConfig,
      autoLoadEntities: true,
    }),
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
