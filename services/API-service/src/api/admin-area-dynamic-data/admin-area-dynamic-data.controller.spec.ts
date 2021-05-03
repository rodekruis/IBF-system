import { UserModule } from '../user/user.module';
import { UploadService } from './admin-area-dynamic-data.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './admin-area-dynamic-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculatedAffectedEntity } from './calculated-affected.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';

describe('UploadController', (): void => {
  let controller: UploadController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([
            TriggerPerLeadTime,
            CalculatedAffectedEntity,
          ]),
          UserModule,
        ],
        controllers: [UploadController],
        providers: [UploadService],
      }).compile();

      controller = module.get<UploadController>(UploadController);
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
