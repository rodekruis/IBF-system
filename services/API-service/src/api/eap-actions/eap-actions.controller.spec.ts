/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';
import { EapActionsController } from './eap-actions.controller';
import { EapActionsService } from './eap-actions.service';

describe('EapActionsController', () => {
  let controller: EapActionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([
          UserEntity,
          EapActionEntity,
          EapActionStatusEntity,
          AreaOfFocusEntity,
        ]),
      ],
      controllers: [EapActionsController],
      providers: [EapActionsService],
    }).compile();

    controller = module.get<EapActionsController>(EapActionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
