import { Test, TestingModule } from '@nestjs/testing';
import { EapActionsController } from './eap-actions.controller';

describe('EapActionsController', () => {
  let controller: EapActionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EapActionsController],
    }).compile();

    controller = module.get<EapActionsController>(EapActionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
