import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { formatISO } from 'date-fns';
import { Repository } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { EventService } from '../event/event.service';
import { NotificationService } from '../notification/notification.service';
import { ProcessEventsService } from '../process-events/process-events.service';

describe('ProcessEventsService', () => {
  let service: ProcessEventsService;
  let helperService: HelperService;
  let notificationService: NotificationService;
  let eventPlaceCodeRepository: Repository<EventPlaceCodeEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessEventsService,
        {
          provide: EventService,
          useValue: {},
        },
        {
          provide: HelperService,
          useValue: {
            getLastUploadDate: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EventPlaceCodeEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProcessEventsService>(ProcessEventsService);
    helperService = module.get<HelperService>(HelperService);
    notificationService = module.get<NotificationService>(NotificationService);
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
      const getLastUploadDateResult = {
        timestamp: new Date(),
        date: formatISO(new Date()),
        cutoffMoment: new Date(),
      };
      jest
        .spyOn(eventPlaceCodeRepository, 'update')
        .mockResolvedValue(updateResult);
      jest
        .spyOn(helperService, 'getLastUploadDate')
        .mockResolvedValue(getLastUploadDateResult);
      jest.spyOn(notificationService, 'send');

      const setTriggerDto = {
        eventPlaceCodeIds: ['29bba7a0-f692-48bd-9032-b04067cab2b7'],
        countryCodeISO3: 'PHL',
        disasterType: DisasterType.Typhoon,
        noNotifications: true,
      };
      const userId = '57084ea4-cac9-4f29-b955-fe9f08beb588';

      // Act
      await service.setTrigger(userId, setTriggerDto);

      // Assert
      expect(eventPlaceCodeRepository.update).toHaveBeenCalledWith(
        expect.arrayContaining(setTriggerDto.eventPlaceCodeIds),
        expect.objectContaining({
          userTrigger: true,
          user: { userId },
        }),
      );

      expect(helperService.getLastUploadDate).toHaveBeenCalledWith(
        setTriggerDto.countryCodeISO3,
        setTriggerDto.disasterType,
      );

      expect(notificationService.send).toHaveBeenCalledWith(
        setTriggerDto.countryCodeISO3,
        setTriggerDto.disasterType,
        setTriggerDto.noNotifications,
        getLastUploadDateResult,
      );
    });
  });
});
