import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { EventService } from '../event/event.service';

describe('AdminAreaDynamicDataService', (): void => {
    let service: AdminAreaDynamicDataService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                // imports: [
                //   TypeOrmModule.forRoot(),
                //   TypeOrmModule.forFeature([AdminAreaDynamicDataEntity]),
                // ],
                providers: [
                    AdminAreaDynamicDataService,
                    EventService,
                    EntityManager,
                    {
                        provide: getRepositoryToken(TriggerPerLeadTime),
                        useFactory: repositoryMockFactory,
                    },
                    {
                        provide: getRepositoryToken(AdminAreaDynamicDataEntity),
                        useFactory: repositoryMockFactory,
                    },
                ],
            }).compile();

            service = module.get<AdminAreaDynamicDataService>(
                AdminAreaDynamicDataService,
            );
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
