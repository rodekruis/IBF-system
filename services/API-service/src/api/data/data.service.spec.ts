import { CountryEntity } from './../country/country.entity';
import { DataService } from './data.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriggerPerLeadTime } from '../upload/trigger-per-lead-time.entity';

describe('User service', (): void => {
    let service: DataService;

    beforeAll(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRoot(),
                    TypeOrmModule.forFeature([
                        UserEntity,
                        TriggerPerLeadTime,
                        CountryEntity,
                    ]),
                ],
                providers: [DataService],
            }).compile();

            service = module.get<DataService>(DataService);
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
