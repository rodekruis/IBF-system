import { UserEntity } from './user.entity';
import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseObject } from './user.model';
import { RolesGuard } from '../../roles.guard';
import { UserRole } from './user-role.enum';
import { UserStatus } from './user-status.enum';

const userResponseObject = {
  user: {
    email: 'test@ibf.nl',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJzdHJpZG5nIiwiZW1haWwiOiJ0ZXNkZnN0QHRlc3QubmwiLCJleHAiOjE1NjYwMzE4MzEuMjk0LCJpYXQiOjE1NjA4NDc4MzF9.tAKGcABFXNd2dRsvf3lZ-4KzUvKGeUkmuhrzGKdfLpo',
    userRole: UserRole.DisasterManager,
  },
};

class UserServiceMock {
  public async findByEmail(): Promise<UserResponseObject> {
    return userResponseObject;
  }
  public async create(userData: CreateUserDto): Promise<UserResponseObject> {
    const userResponseObject = {
      user: {
        email: userData.email,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJzdHJpZG5nIiwiZW1haWwiOiJ0ZXNkZnN0QHRlc3QubmwiLCJleHAiOjE1NjYwMzE4MzEuMjk0LCJpYXQiOjE1NjA4NDc4MzF9.tAKGcABFXNd2dRsvf3lZ-4KzUvKGeUkmuhrzGKdfLpo',
        userRole: UserRole.DisasterManager,
      },
    };
    return userResponseObject;
  }
  public async findOne(): Promise<UserEntity> {
    const user = new UserEntity();
    user.userId = '1';
    user.email = 'test@ibf.nl';
    user.password =
      'c90f86e09c3461da52b3d8bc80ccd6a0d0cb893b1a41bd461e8ed31fa21c9b6e';
    user.userRole = UserRole.DisasterManager;
    return user;
  }
  public generateJWT(): string {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJzdHJpZG5nIiwiZW1haWwiOiJ0ZXNkZnN0QHRlc3QubmwiLCJleHAiOjE1NjYwMzE4MzEuMjk0LCJpYXQiOjE1NjA4NDc4MzF9.tAKGcABFXNd2dRsvf3lZ-4KzUvKGeUkmuhrzGKdfLpo';
  }
}

describe('UserController', (): void => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(
    async (): Promise<void> => {
      const module = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          {
            provide: UserService,
            useValue: new UserServiceMock(),
          },
        ],
      })
        .overrideGuard(RolesGuard)
        .useValue({ canActivate: (): boolean => true })
        .compile();
      userService = module.get<UserService>(UserService);
      userController = module.get<UserController>(UserController);
    },
  );

  describe('findMe', (): void => {
    it('should return a user', async (): Promise<void> => {
      const spy = jest
        .spyOn(userService, 'findByEmail')
        .mockImplementation(
          (): Promise<UserResponseObject> =>
            Promise.resolve(userResponseObject),
        );
      const controllerResult = await userController.findMe('test@ibf.nl');

      expect(spy).toHaveBeenCalled();
      expect(controllerResult).toStrictEqual(userResponseObject);
    });
  });

  describe('login', (): void => {
    it('should return a user', async (): Promise<void> => {
      const loginParameters = {
        email: 'test@ibf.nl',
        password: 'string',
      };
      const controllerResult = await userController.login(loginParameters);

      expect(controllerResult).toStrictEqual(userResponseObject);

      const spy = jest
        .spyOn(userService, 'findOne')
        .mockImplementation(
          (): Promise<UserEntity> => Promise.resolve(new UserEntity()),
        );
      await userController.login(loginParameters);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('create', (): void => {
    it('should return an a user entity', async (): Promise<void> => {
      const userValue: CreateUserDto = {
        email: 'test@ibf.nl',
        password: 'string',
        username: 'testUsername',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        countryCodesISO3: ['test'],
        role: UserRole.DisasterManager,
        status: UserStatus.Active,
      };
      const spy = jest
        .spyOn(userService, 'create')
        .mockImplementation(
          (): Promise<UserResponseObject> =>
            Promise.resolve(userResponseObject),
        );
      const controllerResult = await userController.create(userValue);

      expect(spy).toHaveBeenCalled();
      expect(controllerResult).toEqual(userResponseObject);
    });
  });
});
