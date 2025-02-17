import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DisasterTypeEntity } from './disaster-type.entity';
import {
  AddDisasterTypesDto,
  DisasterTypeDto,
} from './dto/add-disaster-type.dto';

@Injectable()
export class DisasterTypeService {
  @InjectRepository(DisasterTypeEntity)
  private readonly disasterTypeRepository: Repository<DisasterTypeEntity>;

  public async addOrUpdateDisasterTypes(
    disasterTypes: AddDisasterTypesDto,
  ): Promise<void> {
    for await (const disasterType of disasterTypes.disasterTypes) {
      const existingDisasterType = await this.disasterTypeRepository.findOne({
        where: {
          disasterType: disasterType.disasterType,
        },
      });
      if (existingDisasterType) {
        await this.addOrUpdateDisasterType(existingDisasterType, disasterType);
        continue;
      }

      const newDisasterType = new DisasterTypeEntity();
      newDisasterType.disasterType = disasterType.disasterType;
      await this.addOrUpdateDisasterType(newDisasterType, disasterType);
    }
  }

  private async addOrUpdateDisasterType(
    disasterTypeEntity: DisasterTypeEntity,
    disasterTypeDto: DisasterTypeDto,
  ): Promise<void> {
    disasterTypeEntity.disasterType = disasterTypeDto.disasterType;
    disasterTypeEntity.label = disasterTypeDto.label;
    disasterTypeEntity.mainExposureIndicator =
      disasterTypeDto.mainExposureIndicator;
    disasterTypeEntity.showOnlyTriggeredAreas =
      disasterTypeDto.showOnlyTriggeredAreas;
    disasterTypeEntity.leadTimeUnit = disasterTypeDto.leadTimeUnit;
    disasterTypeEntity.minLeadTime = disasterTypeDto.minLeadTime;
    disasterTypeEntity.maxLeadTime = disasterTypeDto.maxLeadTime;

    await this.disasterTypeRepository.save(disasterTypeEntity);
  }
}
