import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import { RedcrossBranchEntity } from '../api/redcross-branch/redcross-branch.entity';

interface RedCrossBranch {
  branch_name: string;
  lat: number;
  lon: number;
  number_of_volunteers: number;
  contact_person: string;
  contact_number: string;
  contact_address: string;
}

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
          (branch: RedCrossBranch): Promise<void> => {
            return this.redcrossBranchRepository
              .createQueryBuilder()
              .insert()
              .values({
                countryCodeISO3: country.countryCodeISO3,
                name: branch.branch_name,
                numberOfVolunteers: branch.number_of_volunteers,
                contactPerson: branch.contact_person,
                contactAddress: branch.contact_address,
                contactNumber: branch.contact_number,
                geom: (): string =>
                  `st_asgeojson(st_MakePoint(${branch.lon}, ${branch.lat}))::json`,
              })
              .execute();
          },
        ),
      );
    } catch {
      console.error(`Skip Red Cross branches: ${country.countryCodeISO3}`);
      return Promise.resolve();
    }
  }
}

export default SeedRedcrossBranches;
