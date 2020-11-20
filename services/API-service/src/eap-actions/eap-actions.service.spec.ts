/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';
import { EapActionsService } from './eap-actions.service';

describe('EapActionsService', () => {
  let service: EapActionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([
          UserEntity,
          EapActionStatusEntity,
          EapActionEntity,
          AreaOfFocusEntity,
        ]),
      ],
      providers: [EapActionsService],
    }).compile();

    service = module.get<EapActionsService>(EapActionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
