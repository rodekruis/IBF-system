import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { AdminAreaDataEntity } from '../api/admin-area-data/admin-area-data.entity';
import { SeedHelper } from './seed-helper';
import { AdminLevel } from 'src/api/country/admin-level.enum';

interface AdminAreaDataRecord {
  placeCode: string;
  adminLevel: AdminLevel;
  indicator: string;
  value: number;
}

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
    const envCountries = process.env.COUNTRIES.split(',');

    envCountries.forEach(async (countryCodeISO3: string) => {
      const populationFilename = `./src/scripts/git-lfs/admin-area-data/population_${countryCodeISO3}.csv`;
      try {
        const populationData = await this.seedHelper.getCsvData(
          populationFilename,
        );
        const adminAreaDataEntities = populationData
          .filter(
            (populationRecord: AdminAreaDataRecord) =>
              populationRecord.value >= 0,
          )
          .map((populationRecord: AdminAreaDataRecord) => {
            const adminAreaDataEntity = new AdminAreaDataEntity();
            adminAreaDataEntity.countryCodeISO3 = countryCodeISO3;
            adminAreaDataEntity.adminLevel = populationRecord.adminLevel;
            adminAreaDataEntity.placeCode = populationRecord.placeCode;
            adminAreaDataEntity.indicator = 'populationTotal';
            adminAreaDataEntity.value = populationRecord.value;
            return adminAreaDataEntity;
          });
        this.adminAreaDataRepository.save(adminAreaDataEntities);
      } catch (exception) {
        console.error(`Skip Indicator: Population - ${countryCodeISO3}`);
      }
    });

    // PHL
    if (envCountries.includes('PHL')) {
      // vulnerability_dengue_data_ibfera_PHL
      const dengueVulnerabilityFilename = `./src/scripts/git-lfs/admin-area-data/vulnerability_dengue_data_ibfera_PHL.csv`;
      const dengueVulnerabilityData = await this.seedHelper.getCsvData(
        dengueVulnerabilityFilename,
      );

      await Promise.all(
        dengueVulnerabilityData.map(
          async (area): Promise<void> => {
            return this.adminAreaDataRepository
              .createQueryBuilder()
              .insert()
              .values({
                countryCodeISO3: 'PHL',
                adminLevel: 2,
                placeCode: area['placeCode'],
                indicator: area['indicator'],
                value: area['value'],
              })
              .execute()
              .catch(console.error);
          },
        ),
      );
    }

    // UGA
    if (envCountries.includes('UGA')) {
      // Flood vulnerability
      const floodVulnerabilityFilename = `./src/scripts/git-lfs/admin-area-data/flood_vulnerability_UGA.csv`;
      const floodVulnerabilityData = await this.seedHelper.getCsvData(
        floodVulnerabilityFilename,
      );
      const floodVulnerabilityDataArray = floodVulnerabilityData.map(area => {
        return {
          countryCodeISO3: 'UGA',
          adminLevel: 2,
          placeCode: area['placeCode'],
          indicator: area['indicator'],
          value: area['value'],
        };
      });

      await this.adminAreaDataRepository.save(floodVulnerabilityDataArray);

      // COVID risk
      const covidRiskFilename = `./src/scripts/git-lfs/admin-area-data/covid_risk_UGA.csv`;
      const covidRiskData = await this.seedHelper.getCsvData(covidRiskFilename);
      const covidRiskDataArray = covidRiskData.map(area => {
        return {
          countryCodeISO3: 'UGA',
          adminLevel: 2,
          placeCode: area['placeCode'],
          indicator: area['indicator'],
          value: area['value'],
        };
      });

      await this.adminAreaDataRepository.save(covidRiskDataArray);
    }
  }
}

export default SeedAdminAreaData;
