import { Test } from '@nestjs/testing';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { StoreDataDto } from './dto';
import { RolesGuard } from '../roles.guard';

const data = 'string';
const testData = {
  id: 1,
  userId: 1,
  type: 'string',
  data: 'string',
  created: new Date(Date.UTC(2017, 1, 14)),
};

class DataServiceMock {
  public async get(): Promise<string> {
    return data;
  }
  public async post(storeData: StoreDataDto): Promise<DataEntity> {
    const testDataStorage = {
      id: 1,
      userId: 1,
      type: storeData.type,
      data: storeData.data,
      created: new Date(Date.UTC(2017, 1, 14)),
    };
    return testDataStorage;
  }
}

describe('UserController', (): void => {
  let dataController: DataController;
  let dataService: DataService;

  beforeEach(
    async (): Promise<void> => {
      const module = await Test.createTestingModule({
        controllers: [DataController],
        providers: [
          {
            provide: DataService,
            useValue: new DataServiceMock(),
          },
        ],
      })
        .overrideGuard(RolesGuard)
        .useValue({ canActivate: () => true })
        .compile();
      dataService = module.get<DataService>(DataService);
      dataController = module.get<DataController>(DataController);
    },
  );

  describe('get', (): void => {
    it('should return data', async (): Promise<void> => {
      const getDataParameters = {
        type: 'string',
      };
      const spy = jest
        .spyOn(dataStorageService, 'get')
        .mockImplementation(
          (): Promise<any> => Promise.resolve(testDataStorage),
        );
      const controllerResult = await dataStorageController.get(
        1,
        getDataParameters,
      );

      expect(spy).toHaveBeenCalled();
      expect(controllerResult).toStrictEqual(testDataStorage);
    });
  });

  describe('post', (): void => {
    it.skip('should return data', async (): Promise<void> => {
      const storeDataParameters = {
        type: 'string',
        data: 'string',
      };
      const controllerResult = await dataStorageController.post(
        1,
        storeDataParameters,
      );

      expect(controllerResult).toStrictEqual(testDataStorage);

      const spy = jest
        .spyOn(dataStorageService, 'post')
        .mockImplementation(
          (): Promise<DataStorageEntity> =>
            Promise.resolve(new DataStorageEntity()),
        );
      await dataStorageController.post(1, storeDataParameters);
      expect(spy).toHaveBeenCalled();
    });
  });
});
