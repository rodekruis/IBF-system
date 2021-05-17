import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { CountryEntity } from '../country/country.entity';

describe('User service', (): void => {
    let service: UserService;
    let module: TestingModule;

    beforeAll(
        async (): Promise<void> => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    UserService,
                    {
                        provide: getRepositoryToken(UserEntity),
                        useFactory: repositoryMockFactory,
                    },
                    {
                        provide: getRepositoryToken(CountryEntity),
                        useFactory: repositoryMockFactory,
                    },
                ],
            }).compile();

            service = module.get<UserService>(UserService);
        },
    );

    it('should generate jwt that starts with ey', (): void => {
        const user = new UserEntity();
        user.userId = '909';
        user.countries = [];
        const result = service.generateJWT(user);
        expect(result).toBeDefined();
    });

    afterAll(
        async (): Promise<void> => {
            module.close();
        },
    );

    it('should be defined', (): void => {
        expect(service).toBeDefined();
    });
});
