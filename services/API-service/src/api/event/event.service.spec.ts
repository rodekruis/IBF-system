import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DataSource, Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterTypeService } from '../disaster-type/disaster-type.service';
import { EapActionsService } from '../eap-actions/eap-actions.service';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import { AlertPerLeadTimeEntity } from './alert-per-lead-time.entity';
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let eventPlaceCodeRepository: Repository<EventPlaceCodeEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EapActionsService,
          useValue: {},
        },
        {
          provide: DisasterTypeService,
          useValue: {},
        },
        {
          provide: HelperService,
          useValue: {},
        },
        {
          provide: TyphoonTrackService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: getRepositoryToken(EventPlaceCodeEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AdminAreaDynamicDataEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AdminAreaEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AlertPerLeadTimeEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DisasterTypeEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CountryEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventPlaceCodeRepository = module.get<Repository<EventPlaceCodeEntity>>(
      getRepositoryToken(EventPlaceCodeEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setTrigger', () => {
    it('should set trigger', async () => {
      // Arrange
      const updateResult = {
        generatedMaps: [],
        raw: [],
        affected: 0,
      };
      jest
        .spyOn(eventPlaceCodeRepository, 'update')
        .mockResolvedValue(updateResult);

      const eventPlaceCodesDto = {
        eventPlaceCodeIds: ['29bba7a0-f692-48bd-9032-b04067cab2b7'],
      };
      const userId = '57084ea4-cac9-4f29-b955-fe9f08beb588';

      // Act
      await service.setTrigger(userId, eventPlaceCodesDto);

      // Assert
      expect(eventPlaceCodeRepository.update).toHaveBeenCalledWith(
        expect.arrayContaining(eventPlaceCodesDto.eventPlaceCodeIds),
        expect.objectContaining({
          userTrigger: true,
          user: { userId },
        }),
      );
    });
  });
});
