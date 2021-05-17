import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import { AdminAreaDataService } from './admin-area-data.service';

describe('AdminAreaDataService', (): void => {
    let service: AdminAreaDataService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRoot(),
                    TypeOrmModule.forFeature([AdminAreaDataEntity]),
                ],
                providers: [AdminAreaDataService],
            }).compile();

            service = module.get<AdminAreaDataService>(AdminAreaDataService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
