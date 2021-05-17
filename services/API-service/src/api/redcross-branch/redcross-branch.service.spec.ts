import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedcrossBranchEntity } from './redcross-branch.entity';
import { RedcrossBranchService } from './redcross-branch.service';

describe('RedcrossBranchService', (): void => {
    let service: RedcrossBranchService;

    beforeEach(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRoot(),
                    TypeOrmModule.forFeature([RedcrossBranchEntity]),
                ],
                providers: [RedcrossBranchService],
            }).compile();

            service = module.get<RedcrossBranchService>(RedcrossBranchService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
