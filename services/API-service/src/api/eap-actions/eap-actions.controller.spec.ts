import { CountryEntity } from './../country/country.entity';
import { UserModule } from './../user/user.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';
import { EapActionsController } from './eap-actions.controller';
import { EapActionsService } from './eap-actions.service';

describe('EapActionsController', (): void => {
  let controller: EapActionsController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([
            UserEntity,
            EapActionEntity,
            EapActionStatusEntity,
            AreaOfFocusEntity,
            CountryEntity,
          ]),
          UserModule,
        ],
        controllers: [EapActionsController],
        providers: [EapActionsService],
      }).compile();

      controller = module.get<EapActionsController>(EapActionsController);
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
