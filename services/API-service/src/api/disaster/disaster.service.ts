import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DisasterEntity } from './disaster.entity';
import { AddDisastersDto, DisasterDto } from './dto/add-disaster.dto';

@Injectable()
export class DisasterService {
  @InjectRepository(DisasterEntity)
  private readonly disasterRepository: Repository<DisasterEntity>;

  public async addOrUpdateDisasters(disasters: AddDisastersDto): Promise<void> {
    for await (const disaster of disasters.disasters) {
      const existingDisaster = await this.disasterRepository.findOne({
        where: {
          disasterType: disaster.disasterType,
        },
      });
      if (existingDisaster) {
        await this.addOrUpdateDisaster(existingDisaster, disaster);
        continue;
      }

      const newDisasterType = new DisasterEntity();
      newDisasterType.disasterType = disaster.disasterType;
      await this.addOrUpdateDisaster(newDisasterType, disaster);
    }
  }

  private async addOrUpdateDisaster(
    disasterEntity: DisasterEntity,
    disaster: DisasterDto,
  ): Promise<void> {
    disasterEntity.disasterType = disaster.disasterType;
    disasterEntity.label = disaster.label;
    disasterEntity.triggerUnit = disaster.triggerUnit;
    disasterEntity.actionsUnit = disaster.actionsUnit;
    disasterEntity.showOnlyTriggeredAreas = disaster.showOnlyTriggeredAreas;
    disasterEntity.leadTimeUnit = disaster.leadTimeUnit;
    disasterEntity.minLeadTime = disaster.minLeadTime;
    disasterEntity.maxLeadTime = disaster.maxLeadTime;

    await this.disasterRepository.save(disasterEntity);
  }
}
