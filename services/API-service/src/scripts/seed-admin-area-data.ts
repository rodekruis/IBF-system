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
      const countryCodeISO3 = 'UGA';
      const adminlevel = 2;
      // Flood vulnerability
      const floodVulnerabilityFilename = `./src/scripts/git-lfs/admin-area-data/flood_vulnerability_UGA.csv`;
      const floodVulnerabilityData = await this.seedHelper.getCsvData(
        floodVulnerabilityFilename,
      );
      const floodVulnerabilityDataArray = floodVulnerabilityData.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
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
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: area['indicator'],
          value: area['value'],
        };
      });
      await this.adminAreaDataRepository.save(covidRiskDataArray);
    }

    // ETH
    if (envCountries.includes('ETH')) {
      const countryCodeISO3 = 'ETH';
      const adminlevel = 3;
      // malaria_risk
      let fileName = `./src/scripts/git-lfs/admin-area-data/malaria_risk_ETH.csv`;
      let data = await this.seedHelper.getCsvData(fileName);
      let dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['ADM3_PCODE'],
          indicator: 'malaria_risk',
          value: area['Pv Malaria risk'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // malaria_suitable_temperature
      fileName = `./src/scripts/git-lfs/admin-area-data/malaria_suitable_temperature_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['ADM3_PCODE'],
          indicator: 'malaria_suitable_temperature',
          value: area['Temp_Suitability.Pv'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // total_idps
      fileName = `./src/scripts/git-lfs/admin-area-data/total_idps_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['ADM3_PCODE'],
          indicator: 'total_idps',
          value: area['Total-IDPs'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // motorized_travel_time_to_health
      fileName = `./src/scripts/git-lfs/admin-area-data/travel_time_health_motorized_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['ADM3_PCODE'],
          indicator: 'motorized_travel_time_to_health',
          value: area['TRAVEL TIME TO HEALTH CENTRES BY MOTORISED TRANSPORT'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // walking_travel_time_to_health
      fileName = `./src/scripts/git-lfs/admin-area-data/travel_time_health_walking_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['ADM3_PCODE'],
          indicator: 'walking_travel_time_to_health',
          value: area['TRAVEL TIME TO HEALTH CENTRE_WALK'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // travel_time_cities
      fileName = `./src/scripts/git-lfs/admin-area-data/travel_time_cities_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['ADM3_PCODE'],
          indicator: 'travel_time_cities',
          value: area['travel_time_cities'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // population_u5
      fileName = `./src/scripts/git-lfs/admin-area-data/population_u5_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['ADM3_PCODE'],
          indicator: 'population_u5',
          value: area['ETH_children_under_five'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // Hotspot_General
      fileName = `./src/scripts/git-lfs/admin-area-data/hotspot_general_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: 'Hotspot_General',
          value: area['amount'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // Hotspot_Water
      fileName = `./src/scripts/git-lfs/admin-area-data/hotspot_water_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: 'Hotspot_Water',
          value: area['amount'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // Hotspot_Health
      fileName = `./src/scripts/git-lfs/admin-area-data/hotspot_health_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: 'Hotspot_Health',
          value: area['amount'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // IPC_forecast_short
      fileName = `./src/scripts/git-lfs/admin-area-data/IPC_forecast_short_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: 'IPC_forecast_short',
          value: area['amount'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // IPC_forecast_long
      fileName = `./src/scripts/git-lfs/admin-area-data/IPC_forecast_long_ETH.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: 'IPC_forecast_long',
          value: area['amount'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
    }

    // ZWE
    if (envCountries.includes('ZWE')) {
      const countryCodeISO3 = 'ZWE';
      const adminlevel = 1;
      // ruminants
      let fileName = `./src/scripts/git-lfs/admin-area-data/ruminants_ZWE.csv`;
      let data = await this.seedHelper.getCsvData(fileName);
      let dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: area['indicator'],
          value: area['value'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // cattle
      fileName = `./src/scripts/git-lfs/admin-area-data/cattle_ZWE.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: area['indicator'],
          value: area['value'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // dam_layer
      fileName = `./src/scripts/git-lfs/admin-area-data/dam_ZWE.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: area['indicator'],
          value: area['value'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
      // drought_vulnerability
      fileName = `./src/scripts/git-lfs/admin-area-data/drought_vulnerability_ZWE.csv`;
      data = await this.seedHelper.getCsvData(fileName);
      dataArray = data.map(area => {
        return {
          countryCodeISO3: countryCodeISO3,
          adminLevel: adminlevel,
          placeCode: area['placeCode'],
          indicator: area['indicator'],
          value: area['value'],
        };
      });
      await this.adminAreaDataRepository.save(dataArray);
    }
  }
}

export default SeedAdminAreaData;
