import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RainfallTriggersEntity } from './rainfall-triggers.entity';
import { RainfallTriggersService } from './rainfall-triggers.service';

describe('RainfallTriggersService', (): void => {
  let service: RainfallTriggersService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([RainfallTriggersEntity]),
        ],
        providers: [RainfallTriggersService],
      }).compile();

      service = module.get<RainfallTriggersService>(RainfallTriggersService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
