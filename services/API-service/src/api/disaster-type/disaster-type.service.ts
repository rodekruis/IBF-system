import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DisasterTypeEntity } from './disaster-type.entity';
import { DisasterType } from './disaster-type.enum';
import {
  AddDisasterTypesDto,
  DisasterTypeDto,
} from './dto/add-disaster-type.dto';

@Injectable()
export class DisasterTypeService {
  @InjectRepository(DisasterTypeEntity)
  private readonly disasterTypeRepository: Repository<DisasterTypeEntity>;

  public async getDisasterType(
    disasterType: DisasterType,
  ): Promise<DisasterTypeEntity> {
    return await this.disasterTypeRepository.findOne({
      where: { disasterType },
    });
  }

  public async getMainExposureIndicator(
    disasterType: DisasterType,
  ): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['mainExposureIndicator'],
        where: { disasterType },
      })
    ).mainExposureIndicator;
  }

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
    disasterTypeEntity.enableSetWarningToTrigger =
      disasterTypeDto.enableSetWarningToTrigger;
    disasterTypeEntity.leadTimeUnit = disasterTypeDto.leadTimeUnit;
    disasterTypeEntity.minLeadTime = disasterTypeDto.minLeadTime;
    disasterTypeEntity.maxLeadTime = disasterTypeDto.maxLeadTime;

    await this.disasterTypeRepository.save(disasterTypeEntity);
  }
}
