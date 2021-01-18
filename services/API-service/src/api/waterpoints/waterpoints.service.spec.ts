import { WaterpointsService } from './waterpoints.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';

describe('Waterpoints service', (): void => {
  let service: WaterpointsService;

  beforeAll(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [WaterpointsService],
      }).compile();

      service = module.get<WaterpointsService>(WaterpointsService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
