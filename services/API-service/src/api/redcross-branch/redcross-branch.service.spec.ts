import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { HelperService } from '../../shared/helper.service';
import { RedcrossBranchEntity } from './redcross-branch.entity';
import { RedcrossBranchService } from './redcross-branch.service';

describe('RedcrossBranchService', (): void => {
  let service: RedcrossBranchService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RedcrossBranchService,
          HelperService,
          {
            provide: getRepositoryToken(RedcrossBranchEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<RedcrossBranchService>(RedcrossBranchService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
