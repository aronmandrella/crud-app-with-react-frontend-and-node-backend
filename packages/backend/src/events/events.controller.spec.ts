import { Test, TestingModule } from '@nestjs/testing';
import { ICreateEventDto } from '@project/globals';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

/* -------------------------------------------------------------------------- */
/*                                  EXAMPLES                                  */
/* -------------------------------------------------------------------------- */

const VALID_CREATE_EVENT_DTO: ICreateEventDto = {
  firstName: 'Joe',
  lastName: 'Doe',
  email: 'mail@mail.com',
  date: '2022-04-13T20:00:00.082Z',
};

const VALID_EVENT_ID = 123;

/* -------------------------------------------------------------------------- */
/*                                    MOCKS                                   */
/* -------------------------------------------------------------------------- */

const createMockEventsService = () => {
  return {
    create: jest.fn(() => {
      return 'create_payload' + Math.random();
    }),

    findAll: jest.fn(() => {
      return 'findAll_payload' + Math.random();
    }),

    findOne: jest.fn(() => {
      return 'find_payload' + Math.random();
    }),

    update: jest.fn(() => {
      return 'update_payload' + Math.random();
    }),

    remove: jest.fn(() => {
      return 'remove_payload' + Math.random();
    }),
  };
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */

describe('EventsController', () => {
  let controller: EventsController;
  let mockEventsService: ReturnType<typeof createMockEventsService>;

  beforeEach(async () => {
    mockEventsService = createMockEventsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [EventsService],
    })
      .overrideProvider(EventsService)
      .useValue(mockEventsService)
      .compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const config = [
    { fnName: 'create', args: [VALID_CREATE_EVENT_DTO] },
    { fnName: 'findAll', args: [] },
    { fnName: 'findOne', args: [VALID_EVENT_ID] },
    { fnName: 'update', args: [VALID_EVENT_ID, VALID_CREATE_EVENT_DTO] },
    { fnName: 'remove', args: [VALID_EVENT_ID] },
  ] as const;

  for (const { fnName, args: callArgs } of config) {
    describe(`${fnName}()`, () => {
      let callWithArgs: () => Promise<any>;

      beforeEach(() => {
        callWithArgs = async () =>
          await (controller[fnName] as (...args: any) => Promise<any>)(
            ...callArgs,
          );
      });

      it(`should pass arguments to EventsService ${fnName}()`, async () => {
        await callWithArgs();
        expect(mockEventsService[fnName]).toHaveBeenCalledWith(...callArgs);
      });

      it(`should return result from EventsService ${fnName}()`, async () => {
        const callResult = await callWithArgs();
        expect(mockEventsService[fnName].mock.results[0].value).toBe(
          callResult,
        );
      });

      it(`should fail if EventsService ${fnName}() fails`, async () => {
        const expectedCallException = new Error();
        mockEventsService[fnName].mockImplementationOnce(() => {
          throw expectedCallException;
        });

        await expect(callWithArgs()).rejects.toThrow(expectedCallException);
      });
    });
  }
});
