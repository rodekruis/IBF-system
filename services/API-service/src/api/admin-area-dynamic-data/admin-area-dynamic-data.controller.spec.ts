import { UserModule } from '../user/user.module';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAreaDynamicDataController } from './admin-area-dynamic-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculatedAffectedEntity } from './calculated-affected.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';

describe('AdminAreaDynamicController', (): void => {
  let controller: AdminAreaDynamicDataController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([
            TriggerPerLeadTime,
            CalculatedAffectedEntity,
            AdminAreaDynamicDataEntity,
          ]),
          UserModule,
        ],
        controllers: [AdminAreaDynamicDataController],
        providers: [AdminAreaDynamicDataService],
      }).compile();

      controller = module.get<AdminAreaDynamicDataController>(
        AdminAreaDynamicDataController,
      );
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
