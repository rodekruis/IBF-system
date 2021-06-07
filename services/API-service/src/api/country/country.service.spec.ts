import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

describe('CountryService', (): void => {
  let service: CountryService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CountryService,
          {
            provide: getRepositoryToken(CountryEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<CountryService>(CountryService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
