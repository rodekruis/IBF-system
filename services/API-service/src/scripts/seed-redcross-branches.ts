import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import { RedcrossBranchEntity } from '../api/redcross-branch/redcross-branch.entity';

@Injectable()
export class SeedRedcrossBranches implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private redcrossBranchRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');
    this.redcrossBranchRepository = this.connection.getRepository(
      RedcrossBranchEntity,
    );

    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (envCountries.includes(country.countryCodeISO3)) {
            return this.seedCountryRedcrossBranches(country);
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedCountryRedcrossBranches(country): Promise<void> {
    const redcrossBranchesFilename = `./src/scripts/git-lfs/redcross-branches/redcross_branches_${country.countryCodeISO3}.csv`;
    try {
      const redcrossBranchesData = await this.seedHelper.getCsvData(
        redcrossBranchesFilename,
      );

      await Promise.all(
        redcrossBranchesData.map(
          (branch): Promise<void> => {
            return this.redcrossBranchRepository
              .createQueryBuilder()
              .insert()
              .values({
                countryCode: country.countryCodeISO3,
                name: branch['BRANCH'],
                numberOfVolunteers: branch['TOTAL'],
                contactPerson: branch['PRESIDENT'],
                contactAddress: branch['LOCATION OF OFFICE'],
                contactNumber: null,
                geom: (): string =>
                  `st_MakePoint(${branch['lon']}, ${branch['lat']})`,
              })
              .execute()
              .catch(console.error);
          },
        ),
      );
    } catch {
      return Promise.resolve();
    }
  }
}

export default SeedRedcrossBranches;
