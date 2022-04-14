import request from 'supertest';
import { HttpAdapterHost } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TestAppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/all-exceptions.filter';
import {
  IEventDto,
  ICreateEventDto,
  IEventId,
  IUpdateEventDto,
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
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const createEventsRequestSender = (app: INestApplication) => {
  return {
    create: async (dto: ICreateEventDto): Promise<request.Response> => {
      return await request(app.getHttpServer()).post('/events').send(dto);
    },
    findAll: async (): Promise<request.Response> => {
      return await request(app.getHttpServer()).get('/events');
    },
    findOne: async (id: IEventId): Promise<request.Response> => {
      return await request(app.getHttpServer()).get(`/events/${id}`);
    },
    update: async (
      id: IEventId,
      dto: IUpdateEventDto,
    ): Promise<request.Response> => {
      return await request(app.getHttpServer())
        .patch(`/events/${id}`)
        .send(dto);
    },
    remove: async (id: IEventId): Promise<request.Response> => {
      return await request(app.getHttpServer()).delete(`/events/${id}`);
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe('AppController, Events (e2e)', () => {
  let app: INestApplication;
  let service: ReturnType<typeof createEventsRequestSender>;

  const withEnsureAllEventsUnchangedAssertion = async (
    callback: () => Promise<void>,
  ) => {
    const beforeResponse = await service.findAll();
    expect(beforeResponse.statusCode).toEqual(200);

    await callback();

    const afterResponse = await service.findAll();
    expect(afterResponse.statusCode).toEqual(200);
    expect(afterResponse.body).toEqual(beforeResponse.body);
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    await app.init();

    service = createEventsRequestSender(app);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/events (POST)', () => {
    it('should accept valid events and return created event', async () => {
      const response = await service.create(VALID_CREATE_EVENT_DTO);

      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        ...VALID_CREATE_EVENT_DTO,
        id: expect.any(Number),
      });
    });

    it('should fail if any dto property is missing', async () => {
      for (const key in VALID_CREATE_EVENT_DTO) {
        const PARTIAL_VALID_CREATE_DTO: any = { ...VALID_CREATE_EVENT_DTO };
        delete PARTIAL_VALID_CREATE_DTO[key];

        const response = await service.create(PARTIAL_VALID_CREATE_DTO);
        expect(response.statusCode).toEqual(400);
      }
    });
  });

  describe('/events (GET)', () => {
    it('should return all created events', async () => {
      const createdEntries: IEventDto[] = [];

      for (let i = 0; i < 5; i++) {
        const createResponse = await service.create(VALID_CREATE_EVENT_DTO);
        createdEntries.push(createResponse.body);
      }

      const findAllResponse = await service.findAll();
      expect(findAllResponse.statusCode).toEqual(200);
      expect(findAllResponse.body).toEqual(
        expect.arrayContaining(createdEntries),
      );
    });
  });

  describe('/events/:id (GET)', () => {
    it('should return existing event', async () => {
      for (let i = 0; i < 5; i++) {
        const createResponse = await service.create(VALID_CREATE_EVENT_DTO);
        const findOneResponse = await service.findOne(createResponse.body.id);
        expect(findOneResponse.statusCode).toEqual(200);
        expect(findOneResponse.body).toEqual(createResponse.body);
      }
    });

    it('should fail if event does not exist', async () => {
      const response = await service.findOne(123);
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('/events/:id (DELETE)', () => {
    it('should delete existing event and return it', async () => {
      let createdEvents: IEventDto[] = [];

      for (let i = 0; i < 5; i++) {
        const createResponse = await service.create(VALID_CREATE_EVENT_DTO);
        createdEvents.push(createResponse.body);
      }

      const findAllResponse = await service.findAll();
      expect(findAllResponse.statusCode).toEqual(200);
      expect(findAllResponse.body).toEqual(
        expect.arrayContaining(createdEvents),
      );

      for (const toBeDeletedEvent of createdEvents) {
        const removeResponse = await service.remove(toBeDeletedEvent.id);
        expect(removeResponse.statusCode).toEqual(200);
        expect(removeResponse.body).toEqual(toBeDeletedEvent);

        createdEvents = createdEvents.filter(
          (event) => event.id !== toBeDeletedEvent.id,
        );

        const newFindAllResponse = await service.findAll();
        expect(newFindAllResponse.statusCode).toEqual(200);
        expect(newFindAllResponse.body).toEqual(
          expect.arrayContaining(createdEvents),
        );
      }
    });

    it('should fail if event does not exist', async () => {
      await withEnsureAllEventsUnchangedAssertion(async () => {
        const removeResponse = await service.remove(100000);
        expect(removeResponse.statusCode).toBe(400);
      });
    });
  });

  describe('/events/:id (PATCH)', () => {
    it('should update existing event and return it', async () => {
      for (const updateDto of VALID_UPDATE_DTOS) {
        const createResponse = await service.create(VALID_CREATE_EVENT_DTO);
        const newEvent = createResponse.body;
        const expectedNewEventAfterUpdate = { ...newEvent, ...updateDto };

        const updateResponse = await service.update(newEvent.id, updateDto);
        expect(updateResponse.statusCode).toEqual(200);
        expect(updateResponse.body).toEqual(expectedNewEventAfterUpdate);

        const findOneResponse = await service.findOne(newEvent.id);
        expect(findOneResponse.statusCode).toEqual(200);
        expect(findOneResponse.body).toEqual(expectedNewEventAfterUpdate);
      }
    });

    it('should fail if event does not exist', async () => {
      await withEnsureAllEventsUnchangedAssertion(async () => {
        const response = await service.update(100000, VALID_CREATE_EVENT_DTO);
        expect(response.statusCode).toEqual(400);
      });
    });

    it('should fail if client tries to change event id', async () => {
      for (const updateDto of VALID_UPDATE_DTOS) {
        const createResponse = await service.create(VALID_CREATE_EVENT_DTO);
        const newEvent = createResponse.body;

        await withEnsureAllEventsUnchangedAssertion(async () => {
          const updateResponse = await service.update(newEvent.id, {
            ...updateDto,
            id: 10,
          } as any);
          expect(updateResponse.statusCode).toEqual(400);
        });
      }
    });
  });

  describe('/events/:id (PATCH) and /events (POST)', () => {
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

          await withEnsureAllEventsUnchangedAssertion(async () => {
            const failedCreateResponse = await service.create(INVALID_DTO);
            expect(failedCreateResponse.statusCode).toEqual(400);
          });

          const createResponse = await service.create(VALID_CREATE_EVENT_DTO);
          expect(createResponse.statusCode).toEqual(201);
          const newEvent = createResponse.body;

          await withEnsureAllEventsUnchangedAssertion(async () => {
            const updateResponse = await service.update(
              newEvent.id,
              INVALID_DTO,
            );
            expect(updateResponse.statusCode).toEqual(400);
          });
        });
      }
    }
  });
});
