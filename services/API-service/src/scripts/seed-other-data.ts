import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import { RainfallTriggersEntity } from '../api/rainfall-triggers/rainfall-triggers.entity';

@Injectable()
export class SeedOther implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private rainfallTriggersRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    this.rainfallTriggersRepository = this.connection.getRepository(
      RainfallTriggersEntity,
    );

    // EGY
    // Trigger levels per lat/lon pixel
    const fileName = `./src/scripts/git-lfs/other/rainfall_trigger_levels_EGY.csv`;
    const data = await this.seedHelper.getCsvData(fileName);

    await Promise.all(
      data.map(
        async (pixel): Promise<void> => {
          return this.rainfallTriggersRepository
            .createQueryBuilder()
            .insert()
            .values({
              countryCode: 'EGY',
              lat: pixel['lat'],
              lon: pixel['lon'],
              leadTime: pixel['forecast_time'],
              triggerLevel: pixel['5yr_threshold'],
              threshold99Perc: pixel['threshold_99perc'],
              threshold2Year: pixel['2yr_threshold'],
              threshold5Year: pixel['5yr_threshold'],
              threshold10Year: pixel['10yr_threshold'],
              threshold20Year: pixel['20yr_threshold'],
              threshold50Year: pixel['50yr_threshold'],
              threshold100Year: pixel['100yr_threshold'],
            })
            .execute()
            .catch(console.error);
        },
      ),
    );
  }
}

export default SeedOther;
