import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import {
  IEventDto,
  ICreateEventDto,
  IEventId,
  DtoAssertionError,
} from '@project/globals';

/* -------------------------------------------------------------------------- */
/*                                  EXAMPLES                                  */
/* -------------------------------------------------------------------------- */

const VALID_CREATE_EVENT_DTO: ICreateEventDto = {
  firstName: 'Joe',
  lastName: 'Doe',
  email: 'mail@mail.com',
  date: '2022-04-13T20:00:00.082Z',
};

const VALID_UPDATE_DTOS = [
  { firstName: 'abc' },
  { lastName: 'def' },
  { date: '2022-04-13T20:10:00.082Z' },
  { email: 'abc@efg.com' },
  {
    firstName: 'abc',
    lastName: 'def',
  },
  {
    firstName: 'abc',
    lastName: 'def',
    date: '2022-04-13T20:10:00.082Z',
    email: 'abc@efg.com',
  },
];

/* -------------------------------------------------------------------------- */
/*                                    MOCKS                                   */
/* -------------------------------------------------------------------------- */

const createMockEventsRepository = () => {
  const db: {
    events: IEventDto[];
  } = {
    events: [],
  };

  return {
    create: jest.fn((dto: ICreateEventDto): IEventDto => {
      const newEventId = db.events.length
        ? db.events[db.events.length - 1].id + 1
        : 1;

      return { ...dto, id: newEventId };
    }),

    find: jest.fn(async (): Promise<IEventDto[]> => {
      return db.events;
    }),

    findOne: jest.fn(async (id: IEventId): Promise<IEventDto> => {
      const event = db.events.find((event) => event.id === id);

      if (event) {
        return event;
      } else {
        throw new Error('Event not found');
      }
    }),

    remove: jest.fn(async (toBeRemovedEvent: IEventDto): Promise<void> => {
      db.events = db.events.filter((event) => event.id !== toBeRemovedEvent.id);
    }),

    save: jest.fn(async (toBeSavedEvent: IEventDto): Promise<IEventDto> => {
      let didFindEvent = false;

      db.events = db.events.map((event) => {
        if (event.id === toBeSavedEvent.id) {
          didFindEvent = true;
          return toBeSavedEvent;
        } else {
          return event;
        }
      });

      if (!didFindEvent) {
        db.events.push(toBeSavedEvent);
      }

      return toBeSavedEvent;
    }),
  };
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe('EventsService', () => {
  let service: EventsService;
  let mockEventsRepository: ReturnType<typeof createMockEventsRepository>;

  beforeEach(async () => {
    mockEventsRepository = createMockEventsRepository();

    const mockEventsRepositoryProvider = {
      provide: getRepositoryToken(Event),
      useValue: mockEventsRepository,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, mockEventsRepositoryProvider],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should accept valid events and return created event', async () => {
      const result = await service.create(VALID_CREATE_EVENT_DTO);

      expect(result).toEqual({
        ...VALID_CREATE_EVENT_DTO,
        id: expect.any(Number),
      });
    });

    it('should fail if any dto property is missing', async () => {
      for (const key in VALID_CREATE_EVENT_DTO) {
        const PARTIAL_VALID_CREATE_DTO: any = { ...VALID_CREATE_EVENT_DTO };
        delete PARTIAL_VALID_CREATE_DTO[key];

        const throwingAsyncFn = async () =>
          await service.create(PARTIAL_VALID_CREATE_DTO);

        await expect(throwingAsyncFn()).rejects.toThrow();
      }
    });
  });

  describe('findAll()', () => {
    it('should return all created events', async () => {
      expect(await service.findAll()).toEqual([]);

      const createdEntries: IEventDto[] = [];
      for (let i = 0; i < 5; i++) {
        createdEntries.push(await service.create(VALID_CREATE_EVENT_DTO));
      }

      expect(await service.findAll()).toEqual(createdEntries);
    });
  });

  describe('findOne()', () => {
    it('should return existing event', async () => {
      for (let i = 0; i < 5; i++) {
        const newEvent = await service.create(VALID_CREATE_EVENT_DTO);
        expect(await service.findOne(newEvent.id)).toEqual(newEvent);
      }
    });

    it('should fail if event does not exist', async () => {
      const throwingAsyncFn = async () => await service.findOne(123);
      await expect(throwingAsyncFn()).rejects.toThrow();
    });
  });

  describe('remove()', () => {
    it('should delete existing event and return it', async () => {
      let existingEvents: IEventDto[] = [];

      for (let i = 0; i < 5; i++) {
        existingEvents.push(await service.create(VALID_CREATE_EVENT_DTO));
      }

      expect(await service.findAll()).toEqual(existingEvents);

      for (const toBeDeletedEvent of existingEvents) {
        expect(await service.remove(toBeDeletedEvent.id)).toEqual(
          toBeDeletedEvent,
        );
        existingEvents = existingEvents.filter(
          (event) => event.id !== toBeDeletedEvent.id,
        );
        expect(await service.findAll()).toEqual(existingEvents);
      }
    });

    it('should fail if event does not exist', async () => {
      const throwingAsyncFn = async () => await service.remove(123);
      await expect(throwingAsyncFn()).rejects.toThrow();
    });
  });

  describe('update()', () => {
    it('should update existing event and return it', async () => {
      for (const updateDto of VALID_UPDATE_DTOS) {
        const newEvent = await service.create(VALID_CREATE_EVENT_DTO);
        const expectedNewEventAfterUpdate = { ...newEvent, ...updateDto };

        const updatedEvent = await service.update(newEvent.id, updateDto);
        const updatedEventQueried = await service.findOne(newEvent.id);

        expect(updatedEvent).toEqual(expectedNewEventAfterUpdate);
        expect(updatedEventQueried).toEqual(expectedNewEventAfterUpdate);
      }
    });

    it('should fail if event does not exist', async () => {
      const throwingAsyncFn = async () =>
        await service.update(123, VALID_CREATE_EVENT_DTO);
      await expect(throwingAsyncFn()).rejects.toThrow();
    });

    it('should fail if client tries to change event id', async () => {
      for (const updateDto of VALID_UPDATE_DTOS) {
        const newEvent = await service.create(VALID_CREATE_EVENT_DTO);

        const throwingAsyncFn = async () =>
          await service.update(newEvent.id, { ...updateDto, id: 10 } as any);

        await expect(throwingAsyncFn()).rejects.toThrow();
      }
    });
  });

  describe('update() and create()', () => {
    const notANotEmptyString = [1, '', false, null, 0, {}, []];

    const INVALID_EXAMPLES_BY_KEY = {
      firstName: notANotEmptyString,
      lastName: notANotEmptyString,
      email: [
        ...notANotEmptyString,
        'eeee',
        '222@',
        'wwww@wwww',
        '2022-04-13T20:00:00.082Z',
      ],
      date: [
        ...notANotEmptyString,
        'wwww',
        '1000.10',
        'Date',
        '20220413T20:00:00.082Z',
        'mail@mail.com',
      ],
    };

    for (const [key, invalidValues] of Object.entries(
      INVALID_EXAMPLES_BY_KEY,
    )) {
      for (const invalidValue of invalidValues) {
        it(`should fail assertion if dto data at '${key}' is '${invalidValue}'`, async () => {
          const INVALID_DTO: any = { ...VALID_CREATE_EVENT_DTO };
          INVALID_DTO[key] = invalidValue;

          const throwingAsyncFn1 = async () =>
            await service.create(INVALID_DTO);
          await expect(throwingAsyncFn1()).rejects.toThrow(DtoAssertionError);

          const newEvent = await service.create(VALID_CREATE_EVENT_DTO);
          const throwingAsyncFn2 = async () =>
            await service.update(newEvent.id, INVALID_DTO);
          await expect(throwingAsyncFn2()).rejects.toThrow(DtoAssertionError);
        });
      }
    }
  });
});
