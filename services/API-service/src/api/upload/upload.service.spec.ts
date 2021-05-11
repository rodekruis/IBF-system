import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { CalculatedAffectedEntity } from './calculated-affected.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { UploadService } from './upload.service';

describe('UploadService', (): void => {
    let service: UploadService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    UploadService,
                    EntityManager,
                    {
                        provide: getRepositoryToken(TriggerPerLeadTime),
                        useFactory: repositoryMockFactory,
                    },
                    {
                        provide: getRepositoryToken(CalculatedAffectedEntity),
                        useFactory: repositoryMockFactory,
                    },
                ],
            }).compile();

            service = module.get<UploadService>(UploadService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
