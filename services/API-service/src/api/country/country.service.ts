import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { AdminLevel } from './admin-level.enum';
import { CountryDisasterSettingsEntity } from './country-disaster.entity';
import { CountryStatus } from './country-status.enum';
import { CountryEntity } from './country.entity';
import {
  AddCountriesDto,
  CountryDisasterSettingsDto,
  CountryDto,
} from './dto/add-countries.dto';

@Injectable()
export class CountryService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  private readonly disasterRepository: Repository<DisasterEntity>;
  private readonly countryDisasterSettingsRepository: Repository<
    CountryDisasterSettingsEntity
  >;
  private readonly leadTimeRepository: Repository<LeadTimeEntity>;

  private readonly relations: string[] = [
    'countryDisasterSettings',
    'countryDisasterSettings.activeLeadTimes',
    'disasterTypes',
    'disasterTypes.leadTimes',
    'notificationInfo',
  ];

  public async getAllCountries(): Promise<CountryEntity[]> {
    return await this.countryRepository.find({
      relations: this.relations,
    });
  }

  public async getCountries(
    countryCodesISO3?: string,
  ): Promise<CountryEntity[]> {
    const countryCodes = countryCodesISO3.split(',');
    return await this.countryRepository.find({
      where: { countryCodeISO3: In(countryCodes) },
      relations: this.relations,
    });
  }

  public async findOne(countryCodeISO3: string): Promise<CountryEntity> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };

    return await this.countryRepository.findOne(findOneOptions, {
      relations: this.relations,
    });
  }

  public async addOrUpdateCountries(countries: AddCountriesDto): Promise<void> {
    const countriesToSave = [];
    for await (const country of countries.countries) {
      const existingCountry = await this.countryRepository.findOne({
        where: {
          countryCodeISO3: country.countryCodeISO3,
        },
      });
      if (existingCountry) {
        await this.addOrUpdateCountry(existingCountry, country);
        continue;
      }

      const newCountry = new CountryEntity();
      newCountry.countryCodeISO3 = country.countryCodeISO3;
      await this.addOrUpdateCountry(newCountry, country);
    }
  }

  private async addOrUpdateCountry(
    countryEntity: CountryEntity,
    country: CountryDto,
  ) {
    countryEntity.countryCodeISO2 = country.countryCodeISO2;
    countryEntity.countryName = country.countryName;
    countryEntity.countryStatus = country.countryStatus as CountryStatus;
    countryEntity.adminRegionLabels = JSON.parse(
      JSON.stringify(country.adminRegionLabels),
    );
    countryEntity.disasterTypes = await this.disasterRepository.find({
      where: country.disasterTypes.map(
        (countryDisasterType: DisasterType): object => {
          return { disasterType: countryDisasterType };
        },
      ),
    });
    countryEntity.countryLogos = country.countryLogos;
    countryEntity.countryBoundingBox = JSON.parse(
      JSON.stringify(country.countryBoundingBox),
    );
    countryEntity.countryDisasterSettings = [];

    await this.countryRepository.save(countryEntity);

    for await (const disaster of country.countryDisasterSettings) {
      const existingDisaster = await this.countryDisasterSettingsRepository.findOne(
        {
          where: {
            countryCodeISO3: country.countryCodeISO3,
            disasterType: disaster.disasterType,
          },
        },
      );
      if (existingDisaster) {
        const savedDisaster = await this.addOrUpdateDisaster(
          existingDisaster,
          disaster,
        );
        countryEntity.countryDisasterSettings.push(savedDisaster);
        continue;
      }

      const newDisaster = new CountryDisasterSettingsEntity();
      newDisaster.country = await this.countryRepository.findOne({
        where: { countryCodeISO3: country.countryCodeISO3 },
      });
      newDisaster.disasterType = disaster.disasterType as DisasterType;
      const savedDisaster = await this.addOrUpdateDisaster(
        newDisaster,
        disaster,
      );
      countryEntity.countryDisasterSettings.push(savedDisaster);
    }

    await this.countryRepository.save(countryEntity);
  }

  private async addOrUpdateDisaster(
    countryDisasterSettingsEntity: CountryDisasterSettingsEntity,
    disaster: CountryDisasterSettingsDto,
  ) {
    countryDisasterSettingsEntity.adminLevels = disaster.adminLevels as AdminLevel[];
    countryDisasterSettingsEntity.defaultAdminLevel = disaster.defaultAdminLevel as AdminLevel;
    countryDisasterSettingsEntity.eapLink = disaster.eapLink;
    countryDisasterSettingsEntity.eapAlertClasses = disaster.eapAlertClasses
      ? JSON.parse(JSON.stringify([disaster.eapAlertClasses]))[0]
      : null;
    countryDisasterSettingsEntity.droughtForecastMonths = disaster.droughtForecastMonths
      ? JSON.parse(JSON.stringify(disaster.droughtForecastMonths))
      : null;
    countryDisasterSettingsEntity.droughtEndOfMonthPipeline =
      disaster.droughtEndOfMonthPipeline;
    countryDisasterSettingsEntity.droughtAreas = disaster.droughtAreas
      ? JSON.parse(JSON.stringify(disaster.droughtAreas))
      : null;
    countryDisasterSettingsEntity.showMonthlyEapActions =
      disaster.showMonthlyEapActions;
    countryDisasterSettingsEntity.monthlyForecastInfo = disaster.monthlyForecastInfo
      ? JSON.parse(JSON.stringify(disaster.monthlyForecastInfo))
      : null;
    countryDisasterSettingsEntity.activeLeadTimes = await this.leadTimeRepository.find(
      {
        where: disaster.activeLeadTimes.map(
          (countryLeadTime: string): object => {
            return { leadTimeName: countryLeadTime };
          },
        ),
      },
    );
    const saveResult = await this.countryDisasterSettingsRepository.save(
      countryDisasterSettingsEntity,
    );
    const savedEntity = await this.countryDisasterSettingsRepository.findOne(
      saveResult.countryDisasterSettingsId,
    );
    return savedEntity;
  }
}
