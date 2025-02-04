import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { Repository } from 'typeorm';

import disasterTypes from '../../scripts/json/disaster-types.json';
import {
  LeadTime,
  LeadTimeUnit,
} from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from './disaster-type.enum';
import { DisasterTypeService } from './disaster-type.service';
import { DisasterTypeDto } from './dto/add-disaster-type.dto';

describe('DisasterService', () => {
  let service: DisasterTypeService;
  let disasterTypeRepository: Repository<DisasterTypeEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisasterTypeService,
        {
          provide: getRepositoryToken(DisasterTypeEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DisasterTypeService>(DisasterTypeService);
    disasterTypeRepository = module.get<Repository<DisasterTypeEntity>>(
      getRepositoryToken(DisasterTypeEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOrUpdateDisasterTypes', () => {
    it('should add or update disasterTypes', async () => {
      // Arrange
      jest
        .spyOn(disasterTypeRepository, 'findOne')
        .mockResolvedValue(new DisasterTypeEntity());
      jest
        .spyOn(disasterTypeRepository, 'save')
        .mockResolvedValue(new DisasterTypeEntity());

      const disasterTypeDtos = disasterTypes.map(
        (disasterType): DisasterTypeDto => {
          const disasterTypeDto = new DisasterTypeDto();
          disasterTypeDto.disasterType =
            disasterType.disasterType as DisasterType;
          disasterTypeDto.label = disasterType.label;
          disasterTypeDto.triggerUnit = disasterType.triggerUnit;
          disasterTypeDto.actionsUnit = disasterType.actionsUnit;
          disasterTypeDto.showOnlyTriggeredAreas =
            disasterType.showOnlyTriggeredAreas;
          disasterTypeDto.leadTimeUnit =
            disasterType.leadTimeUnit as LeadTimeUnit;
          disasterTypeDto.minLeadTime = disasterType.minLeadTime as LeadTime;
          disasterTypeDto.maxLeadTime = disasterType.maxLeadTime as LeadTime;
          return disasterTypeDto;
        },
      );

      // Act
      await service.addOrUpdateDisasterTypes({
        disasterTypes: disasterTypeDtos,
      });

      // Assert
      for (const disasterType of disasterTypes) {
        expect(disasterTypeRepository.findOne).toHaveBeenCalledWith({
          where: { disasterType: disasterType.disasterType },
        });
        expect(disasterTypeRepository.save).toHaveBeenCalled();
      }
    });
  });
});
