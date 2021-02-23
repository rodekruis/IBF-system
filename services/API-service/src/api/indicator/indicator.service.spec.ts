import { UserEntity } from './../user/user.entity';
import { DataService } from './../data/data.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorEntity } from './indicator.entity';
import { IndicatorService } from './indicator.service';

describe('IndicatorService', (): void => {
  let service: IndicatorService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([IndicatorEntity, UserEntity]),
        ],
        providers: [IndicatorService, DataService],
      }).compile();

      service = module.get<IndicatorService>(IndicatorService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
