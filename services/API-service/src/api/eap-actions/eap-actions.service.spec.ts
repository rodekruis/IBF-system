import { CountryEntity } from './../country/country.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';
import { EapActionsService } from './eap-actions.service';

describe('EapActionsService', (): void => {
  let service: EapActionsService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([
            UserEntity,
            EapActionStatusEntity,
            EapActionEntity,
            AreaOfFocusEntity,
            CountryEntity,
          ]),
        ],
        providers: [EapActionsService],
      }).compile();

      service = module.get<EapActionsService>(EapActionsService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
