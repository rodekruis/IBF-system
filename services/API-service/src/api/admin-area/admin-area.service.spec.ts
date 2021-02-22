import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAreaEntity } from './adminArea.entity';
import { AdminAreaService } from './admin-area.service';

describe('AdminAreaService', (): void => {
  let service: AdminAreaService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([AdminAreaEntity]),
        ],
        providers: [AdminAreaService],
      }).compile();

      service = module.get<AdminAreaService>(AdminAreaService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
