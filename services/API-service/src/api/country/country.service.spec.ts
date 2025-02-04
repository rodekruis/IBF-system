import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import countries from '../../scripts/json/countries.json';
import notificationInfos from '../../scripts/json/notification-info.json';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { NotificationInfoEntity } from '../notification/notifcation-info.entity';
import { CountryDisasterSettingsEntity } from './country-disaster.entity';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';
import { CountryDisasterSettingsDto } from './dto/add-countries.dto';
import { NotificationInfoDto } from './dto/notification-info.dto';

describe('CountryService', () => {
  let service: CountryService;
  let countryRepository: Repository<CountryEntity>;
  let disasterTypeRepository: Repository<DisasterTypeEntity>;
  let countryDisasterSettingsRepository: Repository<CountryDisasterSettingsEntity>;
  let notificationInfoRepository: Repository<NotificationInfoEntity>;

  const relations = [
    'countryDisasterSettings',
    'disasterTypes',
    'notificationInfo',
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: getRepositoryToken(CountryEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DisasterTypeEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CountryDisasterSettingsEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(NotificationInfoEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
    countryRepository = module.get<Repository<CountryEntity>>(
      getRepositoryToken(CountryEntity),
    );
    disasterTypeRepository = module.get<Repository<DisasterEntity>>(
      getRepositoryToken(DisasterEntity),
    );
    countryDisasterSettingsRepository = module.get<
      Repository<CountryDisasterSettingsEntity>
    >(getRepositoryToken(CountryDisasterSettingsEntity));
    notificationInfoRepository = module.get<Repository<NotificationInfoEntity>>(
      getRepositoryToken(NotificationInfoEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCountries', () => {
    it('should return an array of countries', async () => {
      const result = [new CountryEntity()];
      jest.spyOn(countryRepository, 'find').mockResolvedValue(result);

      expect(await service.getCountries()).toBe(result);
      expect(countryRepository.find).toHaveBeenCalledWith({ relations });
    });

    it('should return an array of countries with specific country codes', async () => {
      const countryCodes = countries
        .map((country) => country.countryCodeISO3)
        .join(',');
      const result = [new CountryEntity()];
      jest.spyOn(countryRepository, 'find').mockResolvedValue(result);

      expect(await service.getCountries(countryCodes)).toBe(result);
      expect(countryRepository.find).toHaveBeenCalledWith({
        where: { countryCodeISO3: In(countryCodes.split(',')) },
        relations,
      });
    });
  });

  describe('addOrUpdateCountries', () => {
    it('should add or update countries', async () => {
      // Arrange
      jest
        .spyOn(countryRepository, 'findOne')
        .mockResolvedValue(new CountryEntity());
      jest
        .spyOn(disasterTypeRepository, 'find')
        .mockResolvedValue([new DisasterEntity()]);
      jest
        .spyOn(countryRepository, 'save')
        .mockResolvedValue(new CountryEntity());
      jest
        .spyOn(countryDisasterSettingsRepository, 'save')
        .mockResolvedValue(new CountryDisasterSettingsEntity());
      jest
        .spyOn(countryDisasterSettingsRepository, 'findOne')
        .mockResolvedValue(new CountryDisasterSettingsEntity());

      // Act
      await service.addOrUpdateCountries({ countries });

      // Assert
      for (const country of countries) {
        expect(countryRepository.findOne).toHaveBeenCalledWith({
          where: { countryCodeISO3: country.countryCodeISO3 },
          relations: ['countryDisasterSettings'],
        });
        expect(disasterTypeRepository.find).toHaveBeenCalledWith({
          where: country.disasterTypes.map((disasterType) => ({
            disasterType,
          })),
        });
        expect(countryRepository.save).toHaveBeenCalled();

        for (const _countryDisasterSetting of country.countryDisasterSettings as CountryDisasterSettingsDto[]) {
          expect(countryDisasterSettingsRepository.save).toHaveBeenCalled();
          expect(
            countryDisasterSettingsRepository.findOne,
          ).toHaveBeenCalledWith({
            where: { countryDisasterSettingsId: undefined },
          });
          expect(countryRepository.findOne).toHaveBeenCalledWith({
            where: { countryCodeISO3: country.countryCodeISO3 },
            relations: ['countryDisasterSettings'],
          });
        }
      }
    });
  });

  describe('addOrUpdateNotificationInfo', () => {
    it('should add or update notification info', async () => {
      jest
        .spyOn(countryRepository, 'findOne')
        .mockResolvedValue(new CountryEntity());
      jest
        .spyOn(service, 'createNotificationInfo')
        .mockResolvedValue(new NotificationInfoEntity());
      jest
        .spyOn(countryRepository, 'save')
        .mockResolvedValue(new CountryEntity());

      const notificationInfoDto = notificationInfos as NotificationInfoDto[];
      await service.addOrUpdateNotificationInfo(notificationInfoDto);

      for (const notificationInfo of notificationInfoDto) {
        expect(countryRepository.findOne).toHaveBeenCalledWith({
          where: { countryCodeISO3: notificationInfo.countryCodeISO3 },
          relations: ['notificationInfo'],
        });
      }
      expect(countryRepository.save).toHaveBeenCalledWith([
        { notificationInfo: {} },
      ]);
    });
  });

  describe('createNotificationInfo', () => {
    it('should create notification info', async () => {
      const getNotificationInfoEntity = (
        notificationInfoDto: NotificationInfoDto,
      ) => {
        const notificationInfoEntity = new NotificationInfoEntity();
        notificationInfoEntity.logo = JSON.parse(
          JSON.stringify(notificationInfoDto.logo),
        );
        notificationInfoEntity.triggerStatement = JSON.parse(
          JSON.stringify(notificationInfoDto.triggerStatement),
        );
        notificationInfoEntity.linkSocialMediaType =
          notificationInfoDto.linkSocialMediaType;
        notificationInfoEntity.linkSocialMediaUrl =
          notificationInfoDto.linkSocialMediaUrl;
        notificationInfoEntity.linkVideo = notificationInfoDto.linkVideo;
        notificationInfoEntity.linkPdf = notificationInfoDto.linkPdf;
        if (notificationInfoDto.useWhatsapp) {
          notificationInfoEntity.useWhatsapp = JSON.parse(
            JSON.stringify(notificationInfoDto.useWhatsapp),
          );
        }
        if (notificationInfoDto.whatsappMessage) {
          notificationInfoEntity.whatsappMessage = JSON.parse(
            JSON.stringify(notificationInfoDto.whatsappMessage),
          );
        }
        notificationInfoEntity.externalEarlyActionForm =
          notificationInfoDto.externalEarlyActionForm!;

        return notificationInfoEntity;
      };

      jest
        .spyOn(notificationInfoRepository, 'findOne')
        .mockResolvedValue(new NotificationInfoEntity());
      jest
        .spyOn(notificationInfoRepository, 'save')
        .mockResolvedValue(new NotificationInfoEntity());

      const notificationInfoDto = notificationInfos[0] as NotificationInfoDto;
      await service.createNotificationInfo(
        new NotificationInfoEntity(),
        notificationInfoDto,
      );

      expect(notificationInfoRepository.findOne).toHaveBeenCalledWith({
        where: { notificationInfoId: undefined },
      });
      expect(notificationInfoRepository.save).toHaveBeenCalledWith(
        getNotificationInfoEntity(notificationInfoDto),
      );
    });
  });
});
