import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';

/*
  TODO
  Write tests.
*/

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
