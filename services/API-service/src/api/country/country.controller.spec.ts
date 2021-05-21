import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { CountryController } from './country.controller';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

describe('CountryController', (): void => {
  let controller: CountryController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([CountryEntity]),
          UserModule,
        ],
        controllers: [CountryController],
        providers: [CountryService],
      }).compile();

      controller = module.get<CountryController>(CountryController);
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
