import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

describe('CountryService', (): void => {
  let service: CountryService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([CountryEntity]),
        ],
        providers: [CountryService],
      }).compile();

      service = module.get<CountryService>(CountryService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
