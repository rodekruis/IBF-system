import fs from 'fs';
import { Readable } from 'stream';

import csv from 'csv-parser';
import { DataSource } from 'typeorm';

export class SeedHelper {
  public constructor(private dataSource: DataSource) {}

  public async getCsvData(source: string): Promise<object[]> {
    const buffer = fs.readFileSync(source);
    let data = await this.csvBufferToArray(buffer, ',');
    if (Object.keys(data[0]).length === 1) {
      data = await this.csvBufferToArray(buffer, ';');
    }
    return data;
  }

  private async csvBufferToArray(buffer, separator): Promise<object[]> {
    const stream = new Readable();
    stream.push(buffer.toString());
    stream.push(null);
    const parsedData = [];
    return await new Promise((resolve, reject): void => {
      stream
        .pipe(csv({ separator }))
        .on('error', (error): void => reject(error))
        .on('data', (row): number => {
          Object.keys(row).forEach((key) =>
            row[key] === '' ? (row[key] = null) : row[key],
          );
          return parsedData.push(row);
        })
        .on('end', (): void => {
          resolve(parsedData);
        });
    });
  }

  public async truncateAll(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    try {
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        if (
          repository.metadata.schema === 'IBF-app' &&
          entity.tableType !== 'view'
        ) {
          let q;
          if (entity.tableName === 'user') {
            q = `DELETE FROM \"${repository.metadata.schema}\".\"${entity.tableName}\" WHERE email <> 'dunant@redcross.nl'`;
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
}
