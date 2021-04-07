import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';

describe('UploadService', (): void => {
  let service: UploadService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [TypeOrmModule.forRoot()],
        providers: [UploadService],
      }).compile();

      service = module.get<UploadService>(UploadService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
