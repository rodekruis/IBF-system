import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminAreaDataEntity } from '../api/admin-area-data/admin-area-data.entity';
import { SeedHelper } from './seed-helper';

@Injectable()
export class SeedAdminAreaData implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private adminAreaDataRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    this.adminAreaDataRepository = this.connection.getRepository(
      AdminAreaDataEntity,
    );

    // UGA
    // Flood vulnerability
    const floodVulnerabilityFilename = `./src/scripts/git-lfs/admin-area-data/flood_vulnerability_UGA.csv`;
    const floodVulnerabilityData = await this.seedHelper.getCsvData(
      floodVulnerabilityFilename,
    );

    await Promise.all(
      floodVulnerabilityData.map(
        async (area): Promise<void> => {
          return this.adminAreaDataRepository
            .createQueryBuilder()
            .insert()
            .values({
              countryCode: 'UGA',
              adminLevel: 2,
              placeCode: area['pcode'],
              key: area['key'],
              value: area['value'],
            })
            .execute()
            .catch(console.error);
        },
      ),
    );

    // COVID risk
    const covidRiskFilename = `./src/scripts/git-lfs/admin-area-data/covid_risk_UGA.csv`;
    const covidRiskData = await this.seedHelper.getCsvData(covidRiskFilename);

    await Promise.all(
      covidRiskData.map(
        async (area): Promise<void> => {
          return this.adminAreaDataRepository
            .createQueryBuilder()
            .insert()
            .values({
              countryCode: 'UGA',
              adminLevel: 2,
              placeCode: area['pcode'],
              key: area['key'],
              value: area['value'],
            })
            .execute()
            .catch(console.error);
        },
      ),
    );
  }
}

export default SeedAdminAreaData;
