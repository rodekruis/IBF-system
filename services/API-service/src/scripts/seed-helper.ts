import { Logger } from '@nestjs/common';

import csv from 'csv-parser';
import fs from 'fs';
import { Readable } from 'stream';
import { DataSource } from 'typeorm';

import { CountryEntity } from '../api/country/country.entity';
import { DisasterTypeEntity } from '../api/disaster-type/disaster-type.entity';
import { UserEntity } from '../api/user/user.entity';
import { UserRole } from '../api/user/user-role.enum';
import { DUNANT_EMAIL } from '../config';

export class SeedHelper {
  private logger = new Logger('SeedHelper');
  public constructor(private dataSource: DataSource) {}

  public async getCsvData<T>(filePath: string): Promise<T[]> {
    try {
      const buffer = fs.readFileSync(filePath);
      let data = await this.csvBufferToArray<T>(buffer, ',');

      if (Object.keys(data[0]).length === 1) {
        data = await this.csvBufferToArray<T>(buffer, ';');
      }

      return data;
    } catch (error) {
      this.logger.warn(`Failed to read CSV file ${error}`);
      return null;
    }
  }

  private async csvBufferToArray<T>(
    buffer: Buffer,
    separator: string,
  ): Promise<T[]> {
    const stream = Readable.from(buffer.toString());
    const data = [];
    return await new Promise((resolve, reject): void => {
      stream
        .pipe(csv({ separator }))
        .on('error', (error) => reject(error))
        .on('data', (row) => {
          Object.keys(row).forEach((key) =>
            row[key] === '' ? (row[key] = null) : row[key],
          );
          return data.push(row);
        })
        .on('end', () => resolve(data));
    });
  }

  public async reset(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    try {
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        if (
          repository.metadata.schema === 'IBF-app' &&
          entity.tableType !== 'view'
        ) {
          let q: string;
          if (entity.tableName === 'user') {
            q = `DELETE FROM \"${repository.metadata.schema}\".\"${entity.tableName}\" WHERE email <> '${DUNANT_EMAIL}';`;
          } else {
            q = `TRUNCATE TABLE \"${repository.metadata.schema}\".\"${entity.tableName}\" CASCADE;`;
          }
          await repository.query(q);
        }
      }
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
  }

  public async createDunantUser() {
    this.logger.log('Create DUNANT user...');

    const userRepository = this.dataSource.getRepository(UserEntity);
    const countryRepository = this.dataSource.getRepository(CountryEntity);
    const disasterTypeRepository =
      this.dataSource.getRepository(DisasterTypeEntity);

    const dunantUser = new UserEntity();
    dunantUser.email = DUNANT_EMAIL;
    dunantUser.firstName = 'Henry';
    dunantUser.lastName = 'Dunant';
    dunantUser.userRole = UserRole.Admin;
    dunantUser.password = process.env.DUNANT_PASSWORD;
    dunantUser.countries = await countryRepository.find();
    dunantUser.disasterTypes = await disasterTypeRepository.find();

    await userRepository.save(dunantUser);
  }

  public async updateDunantUser(dunantUser: UserEntity) {
    this.logger.log('Update DUNANT user...');

    const userRepository = this.dataSource.getRepository(UserEntity);
    const countryRepository = this.dataSource.getRepository(CountryEntity);
    const disasterTypeRepository =
      this.dataSource.getRepository(DisasterTypeEntity);

    // remove existing countries to avoid duplication errors
    await userRepository
      .createQueryBuilder('user')
      .relation(UserEntity, 'countries')
      .of(dunantUser)
      .remove(dunantUser.countries);

    // remove existing disaster types to avoid duplication errors
    await userRepository
      .createQueryBuilder('user')
      .relation(UserEntity, 'disasterTypes')
      .of(dunantUser)
      .remove(dunantUser.disasterTypes);

    // grant dunant user access to all countries and disaster types
    dunantUser.countries = await countryRepository.find();
    dunantUser.disasterTypes = await disasterTypeRepository.find();

    // update password from env
    dunantUser.password = process.env.DUNANT_PASSWORD;

    await userRepository.save(dunantUser);
  }
}
