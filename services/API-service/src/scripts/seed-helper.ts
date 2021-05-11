import { Connection, getManager } from 'typeorm';
import fs from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';

export class SeedHelper {
    private connection: Connection;

    public constructor(connection: Connection) {
        this.connection = connection;
    }

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
        let parsedData = [];
        return await new Promise((resolve, reject): void => {
            stream
                .pipe(csv({ separator: separator }))
                .on('error', (error): void => reject(error))
                .on('data', (row): number => {
                    Object.keys(row).forEach(key =>
                        row[key] === '' ? (row[key] = null) : row[key],
                    );
                    return parsedData.push(row);
                })
                .on('end', (): void => {
                    resolve(parsedData);
                });
        });
    }

    public async runSqlScript(path: string): Promise<void> {
        const entityManager = getManager();
        const query = fs.readFileSync(path).toString();
        await entityManager.query(query);
    }

    public async cleanAll(): Promise<void> {
        const entities = this.connection.entityMetadatas;
        try {
            for (const entity of entities) {
                const repository = await this.connection.getRepository(
                    entity.name,
                );
                if (repository.metadata.schema === 'IBF-app') {
                    const q = `DROP TABLE \"${repository.metadata.schema}\".\"${entity.tableName}\" CASCADE;`;
                    await repository.query(q);
                }
            }
        } catch (error) {
            throw new Error(`ERROR: Cleaning test db: ${error}`);
        }
    }
}
