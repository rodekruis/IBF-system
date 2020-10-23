import { Test, TestingModule } from '@nestjs/testing';
import { EapActionsService } from './eap-actions.service';

describe('EapActionsService', () => {
  let service: EapActionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EapActionsService],
    }).compile();

    service = module.get<EapActionsService>(EapActionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
