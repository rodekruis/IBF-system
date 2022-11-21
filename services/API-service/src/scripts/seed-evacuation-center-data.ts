import { DisasterType } from './../api/disaster/disaster-type.enum';
import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import { EvacuationCenterEntity } from '../api/evacuation-center/evacuation-center.entity';
import { EvacuationCenterDto } from '../api/evacuation-center/dto/upload-evacuation-centers.dto';

@Injectable()
export class SeedEvacuationCenterData implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private evacuationCenterRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    this.evacuationCenterRepository = this.connection.getRepository(
      EvacuationCenterEntity,
    );

    const envCountries = process.env.COUNTRIES.split(',');
    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (
            envCountries.includes(country.countryCodeISO3) &&
            country.disasterTypes.includes(DisasterType.Floods) &&
            country.countryCodeISO3 === 'SSD'
          ) {
            return this.seedEvacuationCenterData(country);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedEvacuationCenterData(country): Promise<void> {
    const evacuationCenterFileName = `./src/scripts/git-lfs/evacuation-centers/evacuation_centers_${country.countryCodeISO3}.csv`;
    const evacuationCenterData = await this.seedHelper.getCsvData(
      evacuationCenterFileName,
    );
    const evacuationCenterArray = evacuationCenterData.map(
      (evacuationCenter: EvacuationCenterDto) => {
        return {
          countryCodeISO3: country.countryCodeISO3,
          evacuationCenterName: evacuationCenter.evacuationCenterName,
          geom: (): string =>
            `st_asgeojson(st_MakePoint(${evacuationCenter['lon']}, ${evacuationCenter['lat']}))::json`,
        };
      },
    );

    await this.evacuationCenterRepository.save(evacuationCenterArray);
  }
}

export default SeedEvacuationCenterData;
