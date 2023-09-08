import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { NotificationInfoDto } from './dto/notification-info.dto';
import { AdminLevel } from './admin-level.enum';
import { CountryDisasterSettingsEntity } from './country-disaster.entity';
import { CountryEntity } from './country.entity';
import {
  AddCountriesDto,
  CountryDisasterSettingsDto,
  CountryDto,
} from './dto/add-countries.dto';
import { NotificationInfoEntity } from '../notification/notifcation-info.entity';

@Injectable()
export class CountryService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(DisasterEntity)
  private readonly disasterRepository: Repository<DisasterEntity>;
  @InjectRepository(CountryDisasterSettingsEntity)
  private readonly countryDisasterSettingsRepository: Repository<
    CountryDisasterSettingsEntity
  >;
  @InjectRepository(LeadTimeEntity)
  private readonly leadTimeRepository: Repository<LeadTimeEntity>;
  @InjectRepository(NotificationInfoEntity)
  private readonly notificationInfoRepository: Repository<
    NotificationInfoEntity
  >;

  private readonly relations: string[] = [
    'countryDisasterSettings',
    'countryDisasterSettings.activeLeadTimes',
    'disasterTypes',
    'notificationInfo',
  ];

  public async getCountries(
    countryCodesISO3?: string,
    minimalInfo?: boolean,
  ): Promise<CountryEntity[]> {
    if (countryCodesISO3) {
      const countryCodes = countryCodesISO3.split(',');
      return await this.countryRepository.find({
        where: { countryCodeISO3: In(countryCodes) },
        relations: minimalInfo ? ['disasterTypes'] : this.relations,
      });
    } else {
      return await this.countryRepository.find({
        relations: minimalInfo ? ['disasterTypes'] : this.relations,
      });
    }
  }

  public async findOne(
    countryCodeISO3: string,
    relations?: string[],
  ): Promise<CountryEntity> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };

    return await this.countryRepository.findOne({
      where: findOneOptions,
      relations: relations || this.relations,
    });
  }

  public async addOrUpdateCountries(
    countries: AddCountriesDto,
    envDisasterTypes?: string[],
  ): Promise<void> {
    for await (const country of countries.countries) {
      const existingCountry = await this.countryRepository.findOne({
        where: {
          countryCodeISO3: country.countryCodeISO3,
        },
        relations: ['countryDisasterSettings'],
      });
      if (existingCountry) {
        await this.addOrUpdateCountry(
          existingCountry,
          country,
          envDisasterTypes as DisasterType[],
        );
        continue;
      }

      const newCountry = new CountryEntity();
      newCountry.countryCodeISO3 = country.countryCodeISO3;
      await this.addOrUpdateCountry(
        newCountry,
        country,
        envDisasterTypes as DisasterType[],
      );
    }
  }

  private async addOrUpdateCountry(
    countryEntity: CountryEntity,
    country: CountryDto,
    envDisasterTypes?: DisasterType[],
  ): Promise<void> {
    countryEntity.countryCodeISO2 = country.countryCodeISO2;
    countryEntity.countryName = country.countryName;
    countryEntity.adminRegionLabels = JSON.parse(
      JSON.stringify(country.adminRegionLabels),
    );
    countryEntity.disasterTypes = await this.disasterRepository.find({
      where: country.disasterTypes
        .filter(disasterType => {
          if (envDisasterTypes) {
            const envDisasterType = envDisasterTypes.find(
              d => d.split(':')[0] === disasterType,
            );
            if (!envDisasterType) {
              return false; // Disaster-type not loaded at all in this environment
            }
            const countries = envDisasterType.split(':')[1];
            if (
              !countries || // Load this disaster-type for all possible countries in this environment
              countries.split('-').includes(country.countryCodeISO3) // Only load this disaster-type for given countries in this environment
            ) {
              return true;
            } else {
              return false;
            }
          }
          return true;
        })
        .map((countryDisasterType: string): object => {
          return { disasterType: countryDisasterType };
        }),
    });
    countryEntity.countryLogos = JSON.parse(
      JSON.stringify(country.countryLogos),
    );
    countryEntity.countryBoundingBox = JSON.parse(
      JSON.stringify(country.countryBoundingBox),
    );
    countryEntity.countryDisasterSettings =
      countryEntity.countryDisasterSettings || [];

    await this.countryRepository.save(countryEntity);

    for await (const disaster of country.countryDisasterSettings) {
      const existingDisaster = countryEntity.countryDisasterSettings.find(
        d => d.disasterType === disaster.disasterType,
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
  ): Promise<CountryDisasterSettingsEntity> {
    countryDisasterSettingsEntity.adminLevels = disaster.adminLevels as AdminLevel[];
    countryDisasterSettingsEntity.defaultAdminLevel = disaster.defaultAdminLevel as AdminLevel;

    countryDisasterSettingsEntity.eapLink = disaster.eapLink;
    countryDisasterSettingsEntity.eapAlertClasses = disaster.eapAlertClasses
      ? JSON.parse(JSON.stringify([disaster.eapAlertClasses]))[0]
      : null;
    countryDisasterSettingsEntity.droughtForecastSeasons = disaster.droughtForecastSeasons
      ? JSON.parse(JSON.stringify(disaster.droughtForecastSeasons))
      : null;

    countryDisasterSettingsEntity.droughtEndOfMonthPipeline =
      disaster.droughtEndOfMonthPipeline;
    countryDisasterSettingsEntity.droughtAreas = disaster.droughtAreas
      ? JSON.parse(JSON.stringify(disaster.droughtAreas))
      : null;
    countryDisasterSettingsEntity.showMonthlyEapActions =
      disaster.showMonthlyEapActions;
    countryDisasterSettingsEntity.enableEarlyActions =
      disaster.enableEarlyActions;
    countryDisasterSettingsEntity.enableStopTrigger =
      disaster.enableStopTrigger;
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
    const savedEntity = await this.countryDisasterSettingsRepository.findOne({
      where: {
        countryDisasterSettingsId: saveResult.countryDisasterSettingsId,
      },
    });
    return savedEntity;
  }

  public async addOrUpdateNotificationInfo(
    notificationInfo: NotificationInfoDto[],
  ): Promise<void> {
    const countriesToSave = [];
    for await (const notificationInfoCountry of notificationInfo) {
      const existingCountry = await this.findOne(
        notificationInfoCountry.countryCodeISO3,
        ['notificationInfo'],
      );

      if (existingCountry.notificationInfo) {
        existingCountry.notificationInfo = await this.createNotificationInfo(
          existingCountry.notificationInfo,
          notificationInfoCountry,
        );
        continue;
      }

      const notificationInfoEntity = new NotificationInfoEntity();
      existingCountry.notificationInfo = await this.createNotificationInfo(
        notificationInfoEntity,
        notificationInfoCountry,
      );
      countriesToSave.push(existingCountry);
    }
    await this.countryRepository.save(countriesToSave);
  }

  public async createNotificationInfo(
    notificationInfoEntity: NotificationInfoEntity,
    notificationInfoCountry: NotificationInfoDto,
  ): Promise<NotificationInfoEntity> {
    notificationInfoEntity.logo = JSON.parse(
      JSON.stringify(notificationInfoCountry.logo),
    );
    notificationInfoEntity.triggerStatement = JSON.parse(
      JSON.stringify(notificationInfoCountry.triggerStatement),
    );
    notificationInfoEntity.linkSocialMediaType =
      notificationInfoCountry.linkSocialMediaType;
    notificationInfoEntity.linkSocialMediaUrl =
      notificationInfoCountry.linkSocialMediaUrl;
    notificationInfoEntity.linkVideo = notificationInfoCountry.linkVideo;
    notificationInfoEntity.linkPdf = notificationInfoCountry.linkPdf;
    if (notificationInfoCountry.useWhatsapp) {
      notificationInfoEntity.useWhatsapp = JSON.parse(
        JSON.stringify(notificationInfoCountry.useWhatsapp),
      );
    }
    if (notificationInfoCountry.whatsappMessage) {
      notificationInfoEntity.whatsappMessage = JSON.parse(
        JSON.stringify(notificationInfoCountry.whatsappMessage),
      );
    }
    notificationInfoEntity.externalEarlyActionForm =
      notificationInfoCountry.externalEarlyActionForm;

    const saveResult = await this.notificationInfoRepository.save(
      notificationInfoEntity,
    );
    const savedEntity = await this.notificationInfoRepository.findOne({
      where: { notificationInfoId: saveResult.notificationInfoId },
    });
    return savedEntity;
  }
}
