import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { Repository } from 'typeorm';

import disasters from '../../scripts/json/disasters.json';
import {
  LeadTime,
  LeadTimeUnit,
} from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { DisasterType } from './disaster-type.enum';
import { DisasterService } from './disaster.service';
import { DisasterDto } from './dto/add-disaster.dto';

describe('DisasterService', () => {
  let service: DisasterService;
  let disasterRepository: Repository<DisasterEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisasterService,
        {
          provide: getRepositoryToken(DisasterEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DisasterService>(DisasterService);
    disasterRepository = module.get<Repository<DisasterEntity>>(
      getRepositoryToken(DisasterEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOrUpdateDisasterTypes', () => {
    it('should add or update disasterTypes', async () => {
      // Arrange
      jest
        .spyOn(disasterRepository, 'findOne')
        .mockResolvedValue(new DisasterEntity());
      jest
        .spyOn(disasterRepository, 'save')
        .mockResolvedValue(new DisasterEntity());

      const disasterDtos = disasters.map((disaster): DisasterDto => {
        const disasterDto = new DisasterDto();
        disasterDto.disasterType = disaster.disasterType as DisasterType;
        disasterDto.label = disaster.label;
        disasterDto.triggerUnit = disaster.triggerUnit;
        disasterDto.actionsUnit = disaster.actionsUnit;
        disasterDto.showOnlyTriggeredAreas = disaster.showOnlyTriggeredAreas;
        disasterDto.leadTimeUnit = disaster.leadTimeUnit as LeadTimeUnit;
        disasterDto.minLeadTime = disaster.minLeadTime as LeadTime;
        disasterDto.maxLeadTime = disaster.maxLeadTime as LeadTime;
        return disasterDto;
      });

      // Act
      await service.addOrUpdateDisasterTypes({ disasters: disasterDtos });

      // Assert
      for (const disaster of disasters) {
        expect(disasterRepository.findOne).toHaveBeenCalledWith({
          where: { disasterType: disaster.disasterType },
        });
        expect(disasterRepository.save).toHaveBeenCalled();
      }
    });
  });
});
