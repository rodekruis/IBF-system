import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import { PointDataEnum } from '../api/point-data/point-data.entity';
import { PointDataService } from '../api/point-data/point-data.service';

@Injectable()
export class SeedPointData implements InterfaceScript {
  private readonly seedHelper: SeedHelper;

  public constructor(
    private pointDataService: PointDataService,
    connection: Connection,
  ) {
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');

    await Promise.all(
      countries.map(
        (country): Promise<void> => {
          if (envCountries.includes(country.countryCodeISO3)) {
            this.seedCountryRedcrossBranches(country);
            this.seedCountryHealthSites(country);
            this.seedEvacuationCenterData(country);
            this.seedDamSiteData(country);
            return;
          } else {
            return Promise.resolve();
          }
        },
      ),
    );
  }

  private async seedCountryRedcrossBranches(country): Promise<void> {
    const redcrossBranchesFilename = `./src/scripts/git-lfs/standard-point-layers/redcross_branches_${country.countryCodeISO3}.csv`;
    try {
      const redcrossBranchesData = await this.seedHelper.getCsvData(
        redcrossBranchesFilename,
      );

      const validatedData = await this.pointDataService.validateArray(
        PointDataEnum.redCrossBranches,
        redcrossBranchesData,
      );
      await this.pointDataService.uploadJson(
        PointDataEnum.redCrossBranches,
        country.countryCodeISO3,
        validatedData,
      );
    } catch {
      return Promise.resolve();
    }
  }
  private async seedCountryHealthSites(country): Promise<void> {
    const healthSiteFilename = `./src/scripts/git-lfs/standard-point-layers/health_sites_${country.countryCodeISO3}.csv`;
    try {
      const healthSiteData = await this.seedHelper.getCsvData(
        healthSiteFilename,
      );

      const validatedData = await this.pointDataService.validateArray(
        PointDataEnum.healthSites,
        healthSiteData,
      );
      await this.pointDataService.uploadJson(
        PointDataEnum.healthSites,
        country.countryCodeISO3,
        validatedData,
      );
    } catch {
      return Promise.resolve();
    }
  }

  private async seedEvacuationCenterData(country): Promise<void> {
    const evacuationCenterFileName = `./src/scripts/git-lfs/standard-point-layers/evacuation_centers_${country.countryCodeISO3}.csv`;
    try {
      const evacuationCenterData = await this.seedHelper.getCsvData(
        evacuationCenterFileName,
      );
      const validatedData = await this.pointDataService.validateArray(
        PointDataEnum.evacuationCenters,
        evacuationCenterData,
      );
      await this.pointDataService.uploadJson(
        PointDataEnum.evacuationCenters,
        country.countryCodeISO3,
        validatedData,
      );
    } catch {
      return Promise.resolve();
    }
  }

  private async seedDamSiteData(country): Promise<void> {
    const damSiteFileName = `./src/scripts/git-lfs/standard-point-layers/dam_sites_${country.countryCodeISO3}.csv`;
    try {
      const damSiteData = await this.seedHelper.getCsvData(damSiteFileName);

      const validatedData = await this.pointDataService.validateArray(
        PointDataEnum.dams,
        damSiteData,
      );
      await this.pointDataService.uploadJson(
        PointDataEnum.dams,
        country.countryCodeISO3,
        validatedData,
      );
    } catch {
      return Promise.resolve();
    }
  }
}

export default SeedPointData;
