import { Repository } from 'typeorm';
import { MockType } from './mock.type';

export const repositoryMockFactory: () => MockType<
    Repository<jest.Mock>
> = jest.fn((): object => ({
    findOne: jest.fn((entity): typeof entity => entity),
    findAndCount: jest.fn((entity): typeof entity => entity),
    findAll: jest.fn((entity): typeof entity => entity),
    create: jest.fn((entity): typeof entity => entity),
    save: jest.fn((entity): typeof entity => entity),
    delete: jest.fn((entity): typeof entity => entity),
    publish: jest.fn((entity): typeof entity => entity),
    unpublish: jest.fn((entity): typeof entity => entity),
}));
