import { Injectable } from '@nestjs/common';
import { InterfaceScript } from './scripts.module';
import { Connection } from 'typeorm';
import { SeedHelper } from './seed-helper';
import countries from './json/countries.json';
import {
  PointDataEntity,
  PointDataEnum,
} from '../api/point-data/point-data.entity';
import { EvacuationCenterDto } from '../api/point-data/dto/upload-evacuation-centers.dto';
import { DamSiteDto } from '../api/point-data/dto/upload-dam-sites.dto';
import { HealthSiteDto } from '../api/point-data/dto/upload-health-sites.dto';
import { RedCrossBranchDto } from '../api/point-data/dto/upload-red-cross-branch.dto';

@Injectable()
export class SeedPointData implements InterfaceScript {
  private connection: Connection;
  private readonly seedHelper: SeedHelper;
  private pointDataRepository;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.seedHelper = new SeedHelper(connection);
  }

  public async run(): Promise<void> {
    const envCountries = process.env.COUNTRIES.split(',');
    this.pointDataRepository = this.connection.getRepository(PointDataEntity);

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
      const redcrossBranchesArray = redcrossBranchesData.map(
        (branch: RedCrossBranchDto) => {
          return {
            countryCodeISO3: country.countryCodeISO3,
            pointDataCategory: PointDataEnum.redCrossBranches,
            attributes: JSON.parse(
              JSON.stringify({
                branchName: branch.branchName,
                numberOfVolunteers: branch.numberOfVolunteers,
                contactPerson: branch.contactPerson,
                contactAddress: branch.contactAddress,
                contactNumber: branch.contactNumber,
              }),
            ),
            geom: (): string =>
              `st_asgeojson(st_MakePoint(${branch.lon}, ${branch.lat}))::json`,
          };
        },
      );
      await this.pointDataRepository.save(redcrossBranchesArray);
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
      const healthSiteArray = healthSiteData.map(
        (healthSite: HealthSiteDto) => {
          return {
            countryCodeISO3: country.countryCodeISO3,
            pointDataCategory: PointDataEnum.healthSites,
            attributes: JSON.parse(
              JSON.stringify({
                name: healthSite['name'] || '-',
                type: healthSite['type'] || '-',
              }),
            ),
            geom: (): string =>
              `st_asgeojson(st_MakePoint(${healthSite.lon}, ${healthSite.lat}))::json`,
          };
        },
      );
      await this.pointDataRepository.save(healthSiteArray);
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
      const evacuationCenterArray = evacuationCenterData.map(
        (evacuationCenter: EvacuationCenterDto) => {
          return {
            countryCodeISO3: country.countryCodeISO3,
            pointDataCategory: PointDataEnum.evacuationCenters,
            attributes: JSON.parse(
              JSON.stringify({
                evacuationCenterName: evacuationCenter.evacuationCenterName,
              }),
            ),
            geom: (): string =>
              `st_asgeojson(st_MakePoint(${evacuationCenter.lon}, ${evacuationCenter.lat}))::json`,
          };
        },
      );

      await this.pointDataRepository.save(evacuationCenterArray);
    } catch {
      return Promise.resolve();
    }
  }

  private async seedDamSiteData(country): Promise<void> {
    const damSiteFileName = `./src/scripts/git-lfs/standard-point-layers/dam_sites_${country.countryCodeISO3}.csv`;
    try {
      const damSiteData = await this.seedHelper.getCsvData(damSiteFileName);
      const damSiteArray = damSiteData.map((dam: DamSiteDto) => {
        return {
          countryCodeISO3: country.countryCodeISO3,
          pointDataCategory: PointDataEnum.dams,
          attributes: JSON.parse(
            JSON.stringify({
              damName: dam.damName,
              fullSupplyCapacity: dam.fullSupplyCapacity,
            }),
          ),
          geom: (): string =>
            `st_asgeojson(st_MakePoint(${dam.lon}, ${dam.lat}))::json`,
        };
      });

      await this.pointDataRepository.save(damSiteArray);
    } catch {
      return Promise.resolve();
    }
  }
}

export default SeedPointData;
