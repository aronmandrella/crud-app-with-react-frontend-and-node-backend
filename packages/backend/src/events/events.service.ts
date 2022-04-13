import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IEventId,
  IEventDto,
  IEventsArrayDto,
  ICreateEventDto,
  IUpdateEventDto,
  assertEventId,
  assertCreateEventDto,
  assertUpdateEventDto,
} from '@project/globals';
import { Event } from './entities/event.entity';

import { BadRequestError, flatAssignDefinedValues } from '../helpers';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  /*
    Ensures consistency of data in the database.
  */
  private normalizeDto<T extends { date?: string }>(dto: T) {
    const dtoCopy = { ...dto };

    if (dtoCopy.date) {
      dtoCopy.date = new Date(dtoCopy.date).toISOString();
    }

    return dtoCopy;
  }

  async create(dto: ICreateEventDto): Promise<IEventDto> {
    /*
      NOTE:
      Makes sure that dto has valid shape, and that properties passed validation. I think that
      assertions are the safest pick for ensuring types, since there is a near zero chance of
      making a typo (using a wrong interface or a wrong assertion). If parameter's interface and
      assertion don't match, there will be either a runtime exception at assertion, or a compile
      time error bellow assertion.
    */
    assertCreateEventDto(dto);
    dto = this.normalizeDto(dto);

    const newEvent = this.eventsRepository.create(dto);

    return this.eventsRepository.save(newEvent);
  }

  async findAll(): Promise<IEventsArrayDto> {
    /*
      NOTE:
      If pagination / infinite scroll would be needed, this call would look more ore less like this:
      this.eventsRepository.find({skip: pageSize * page, take: pageSize});
    */
    return this.eventsRepository.find();
  }

  async findOne(id: IEventId): Promise<IEventDto> {
    assertEventId(id);

    const result = await this.eventsRepository.findOne(id);

    if (result) {
      return result;
    } else {
      throw new BadRequestError(`Event with id '${id}' doesn't exist.`);
    }
  }

  async update(id: IEventId, dto: IUpdateEventDto): Promise<IEventDto> {
    assertEventId(id);
    assertUpdateEventDto(dto);
    dto = this.normalizeDto(dto);

    const event = await this.findOne(id);
    flatAssignDefinedValues(event, dto);

    return this.eventsRepository.save(event);
  }

  async remove(id: IEventId): Promise<IEventDto> {
    assertEventId(id);

    const event = await this.findOne(id);
    this.eventsRepository.remove(event);

    return event;
  }
}
