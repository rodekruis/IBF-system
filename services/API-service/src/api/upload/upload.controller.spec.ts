import { UserModule } from './../user/user.module';
import { UploadService } from './upload.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('UploadController', (): void => {
  let controller: UploadController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [TypeOrmModule.forRoot(), UserModule],
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
