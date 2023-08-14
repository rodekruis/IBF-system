import { Repository } from 'typeorm';
import { MockType } from './mock.type';

export const repositoryMockFactory: () => MockType<Repository<jest.Mock>> =
  jest.fn((): object => ({
    find: jest.fn((entity): typeof entity => entity),
    findOne: jest.fn((entity): typeof entity => entity),
    findAndCount: jest.fn((entity): typeof entity => entity),
    findAll: jest.fn((entity): typeof entity => entity),
    create: jest.fn((entity): typeof entity => entity),
    save: jest.fn((entity): typeof entity => entity),
    delete: jest.fn((entity): typeof entity => entity),
  }));
