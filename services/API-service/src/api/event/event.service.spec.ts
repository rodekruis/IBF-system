import { EventService } from './event.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { EventPlaceCodeEntity } from './event-place-code.entity';

describe('Event service', (): void => {
    let service: EventService;
    beforeAll(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    {
                        provide: getRepositoryToken(EventPlaceCodeEntity),
                        useFactory: repositoryMockFactory,
                    },
                    EventService,
                ],
            }).compile();

            service = module.get<EventService>(EventService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
