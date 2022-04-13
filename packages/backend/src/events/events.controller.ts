import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { EventsService } from './events.service';

import {
  IEventDto,
  IEventsArrayDto,
  ICreateEventDto,
  IUpdateEventDto,
} from '@project/globals';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: ICreateEventDto): Promise<IEventDto> {
    /*
      NOTE:
      Casts dto data without validation (service will be validating this data).
      
      I did it like this, since in big app there is a possibility that this service will be
      reused somewhere else. I think it's safer to full validate data at level that is
      interacting with database to ensure that invalid data will never leak into database.

      Nest has some validation pipes however they are configured with decorators.
      Property will never infer type form decorator so there won't be a lint error
      if you validate data as one type, and cast it as other type. 
      Explicit assertions seems like a a bit safer choice to me.
    */
    return this.eventsService.create(dto);
  }

  @Get()
  @HttpCode(200)
  findAll(): Promise<IEventsArrayDto> {
    /*
      NOTE:
      Big application probably would also use @Query() decorator
      to get requested pagination/infinite scrolling position.
      For example request would look like this: '/events?page=0&pageSize=30',
      instead of like this '/events'.
    */
    return this.eventsService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string): Promise<IEventDto> {
    return this.eventsService.findOne(Number(id));
  }

  @Patch(':id')
  @HttpCode(200)
  update(
    @Param('id') id: string,
    @Body() dto: IUpdateEventDto,
  ): Promise<IEventDto> {
    return this.eventsService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string): Promise<IEventDto> {
    return this.eventsService.remove(Number(id));
  }
}
