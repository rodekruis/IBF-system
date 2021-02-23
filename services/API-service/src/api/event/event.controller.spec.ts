import { EventPcodeEntity } from './event-pcode.entity';
import { EventService } from './event.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';

describe('EventController', (): void => {
  let controller: EventController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([UserEntity, EventPcodeEntity]),
          UserModule,
        ],
        controllers: [EventController],
        providers: [EventService],
      }).compile();

      controller = module.get<EventController>(EventController);
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
