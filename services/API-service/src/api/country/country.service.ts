import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { Country } from '../../scripts/interfaces/country.interface';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { NotificationInfoEntity } from '../notification/notifcation-info.entity';
import { AdminLevel } from './admin-level.enum';
import { CountryEntity } from './country.entity';
import { CountryDisasterSettingsEntity } from './country-disaster.entity';
import { CountryDisasterSettingsDto, CountryDto } from './dto/country.dto';
import { NotificationInfoDto } from './dto/notification-info.dto';

@Injectable()
export class CountryService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(DisasterTypeEntity)
  private readonly disasterTypeRepository: Repository<DisasterTypeEntity>;
  @InjectRepository(CountryDisasterSettingsEntity)
  private readonly countryDisasterSettingsRepository: Repository<CountryDisasterSettingsEntity>;
  @InjectRepository(NotificationInfoEntity)
  private readonly notificationInfoRepository: Repository<NotificationInfoEntity>;

  public async getCountries(
    countryCodesISO3: Country['countryCodeISO3'][] = [],
    relations = [
      'countryDisasterSettings',
      'disasterTypes',
      'notificationInfo',
    ],
  ): Promise<CountryEntity[]> {
    const where = countryCodesISO3.length
      ? { countryCodeISO3: In(countryCodesISO3) }
      : {};
    return await this.countryRepository.find({ where, relations });
  }

  public async upsertCountries(
    countries: CountryDto[],
    envDisasterTypes: DisasterType[] = [],
  ) {
    for await (const country of countries) {
      const existingCountry = await this.countryRepository.findOne({
        where: { countryCodeISO3: country.countryCodeISO3 },
        relations: ['countryDisasterSettings'],
      });
      if (existingCountry) {
        await this.upsertCountry(existingCountry, country, envDisasterTypes);
        continue;
      }

      const newCountry = new CountryEntity();
      newCountry.countryCodeISO3 = country.countryCodeISO3;
      await this.upsertCountry(newCountry, country, envDisasterTypes);
    }
  }

  private async upsertCountry(
    countryEntity: CountryEntity,
    country: CountryDto,
    envDisasterTypes: DisasterType[] = [],
  ): Promise<void> {
    countryEntity.countryName = country.countryName;
    countryEntity.adminRegionLabels = JSON.parse(
      JSON.stringify(country.adminRegionLabels),
    );
    countryEntity.disasterTypes = await this.disasterTypeRepository.find({
      where: country.disasterTypes
        .filter((disasterType) => {
          if (envDisasterTypes.length) {
            const envDisasterType = envDisasterTypes.find(
              (d) => d.split(':')[0] === disasterType,
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

    for await (const disasterType of country.countryDisasterSettings) {
      const existingDisaster = countryEntity.countryDisasterSettings.find(
        (d) => d.disasterType === disasterType.disasterType,
      );
      if (existingDisaster) {
        const savedDisaster = await this.upsertDisaster(
          existingDisaster,
          disasterType,
        );
        countryEntity.countryDisasterSettings.push(savedDisaster);
        continue;
      }

      const newDisasterType = new CountryDisasterSettingsEntity();
      newDisasterType.country = await this.countryRepository.findOne({
        where: { countryCodeISO3: country.countryCodeISO3 },
      });
      newDisasterType.disasterType = disasterType.disasterType as DisasterType;
      const savedDisaster = await this.upsertDisaster(
        newDisasterType,
        disasterType,
      );
      countryEntity.countryDisasterSettings.push(savedDisaster);
    }

    await this.countryRepository.save(countryEntity);
  }

  private async upsertDisaster(
    countryDisasterSettingsEntity: CountryDisasterSettingsEntity,
    countryDisasterSettingsDto: CountryDisasterSettingsDto,
  ): Promise<CountryDisasterSettingsEntity> {
    countryDisasterSettingsEntity.adminLevels =
      countryDisasterSettingsDto.adminLevels as AdminLevel[];
    countryDisasterSettingsEntity.defaultAdminLevel =
      countryDisasterSettingsDto.defaultAdminLevel as AdminLevel;

    countryDisasterSettingsEntity.eapLink = countryDisasterSettingsDto.eapLink;
    countryDisasterSettingsEntity.droughtSeasonRegions =
      countryDisasterSettingsDto.droughtSeasonRegions
        ? JSON.parse(
            JSON.stringify(countryDisasterSettingsDto.droughtSeasonRegions),
          )
        : null;
    countryDisasterSettingsEntity.droughtRegions =
      countryDisasterSettingsDto.droughtRegions
        ? JSON.parse(JSON.stringify(countryDisasterSettingsDto.droughtRegions))
        : null;
    countryDisasterSettingsEntity.showMonthlyEapActions =
      countryDisasterSettingsDto.showMonthlyEapActions;
    countryDisasterSettingsEntity.enableEarlyActions =
      countryDisasterSettingsDto.enableEarlyActions;
    countryDisasterSettingsEntity.forecastSource =
      countryDisasterSettingsDto.forecastSource
        ? JSON.parse(JSON.stringify(countryDisasterSettingsDto.forecastSource))
        : null;
    countryDisasterSettingsEntity.activeLeadTimes =
      countryDisasterSettingsDto.activeLeadTimes as LeadTime[];

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

  public async upsertNotificationInfo(
    notificationInfo: NotificationInfoDto[],
  ): Promise<void> {
    const countriesToSave = [];
    for await (const notificationInfoCountry of notificationInfo) {
      const existingCountry = await this.countryRepository.findOne({
        where: { countryCodeISO3: notificationInfoCountry.countryCodeISO3 },
        relations: ['notificationInfo'],
      });
      if (!existingCountry) {
        // It is not ideal to throw an error halfway, but it's at least better than the 500 error that currently would occur
        throw new HttpException(
          `Country with code ${notificationInfoCountry.countryCodeISO3} not found. If multiple countries passed, then earlier countries have processed correctly, later countries have not.`,
          HttpStatus.NOT_FOUND,
        );
      }

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
