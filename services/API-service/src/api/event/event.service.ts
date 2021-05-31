/* eslint-disable @typescript-eslint/camelcase */
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventPlaceCodeDto } from './dto/event-place-code.dto';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DynamicDataUnit } from '../admin-area-dynamic-data/enum/dynamic-data-unit';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { UploadTriggerPerLeadTimeDto } from './dto/upload-trigger-per-leadtime.dto';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';

@Injectable()
export class EventService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<
    AdminAreaDynamicDataEntity
  >;
  @InjectRepository(TriggerPerLeadTime)
  private readonly triggerPerLeadTimeRepository: Repository<TriggerPerLeadTime>;

  public async uploadTriggerPerLeadTime(
    uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    const triggersPerLeadTime: TriggerPerLeadTime[] = [];
    for (let leadTime of uploadTriggerPerLeadTimeDto.triggersPerLeadTime) {
      // Delete duplicates
      await this.triggerPerLeadTimeRepository.delete({
        date: new Date(),
        countryCodeISO3: uploadTriggerPerLeadTimeDto.countryCodeISO3,
        leadTime: leadTime.leadTime as LeadTime,
      });

      const triggerPerLeadTime = new TriggerPerLeadTime();
      triggerPerLeadTime.date = new Date();
      triggerPerLeadTime.countryCodeISO3 =
        uploadTriggerPerLeadTimeDto.countryCodeISO3;
      triggerPerLeadTime.leadTime = leadTime.leadTime as LeadTime;
      triggerPerLeadTime.triggered = leadTime.triggered;

      triggersPerLeadTime.push(triggerPerLeadTime);
    }

    await this.triggerPerLeadTimeRepository.save(triggersPerLeadTime);
  }

  public async closeEventPcode(
    eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    const eventPlaceCode = await this.eventPlaceCodeRepo.findOne(
      eventPlaceCodeDto.eventPlaceCodeId,
    );
    if (!eventPlaceCode) {
      const errors = 'Event placeCode not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    eventPlaceCode.closed = true;
    eventPlaceCode.manualClosedDate = new Date();
    await this.eventPlaceCodeRepo.save(eventPlaceCode);
  }

  public async processEventAreas() {
    // set all events to activeTrigger=false
    const eventAreas = await this.eventPlaceCodeRepo.find();
    eventAreas.forEach(area => (area.activeTrigger = false));
    await this.eventPlaceCodeRepo.save(eventAreas);

    // update active ones to true + update population and end_date
    await this.updateExistingEventAreas();

    // add new ones
    await this.addNewEventAreas();

    // close old events
    await this.closeEventsAutomatic();
  }

  private async updateExistingEventAreas() {
    const q = this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "exposureValue"')
      .addSelect('MAX(area."leadTime") AS "leadTime"')
      .where('key IN(:...keys)', {
        keys: [
          DynamicDataUnit.populationAffected,
          DynamicDataUnit.alertThreshold,
        ],
      })
      .andWhere('value > 0')
      .andWhere('date = current_date')
      .groupBy('area."placeCode"');
    const affectedAreas = await q.getRawMany();
    const affectedAreasPlaceCodes = affectedAreas.map(area => area.placeCode);
    const unclosedEventAreas = await this.eventPlaceCodeRepo.find({
      where: { closed: false },
    });
    let affectedArea;
    unclosedEventAreas.forEach(unclosedEventArea => {
      if (affectedAreasPlaceCodes.includes(unclosedEventArea.placeCode)) {
        affectedArea = affectedAreas.find(
          area => area.placeCode === unclosedEventArea.placeCode,
        );
        unclosedEventArea.activeTrigger = true;
        unclosedEventArea.exposureValue = affectedArea.exposureValue;
        unclosedEventArea.endDate = this.getEndDate(affectedArea.leadTime);
      }
    });
    await this.eventPlaceCodeRepo.save(unclosedEventAreas);
  }

  private async addNewEventAreas() {
    const affectedAreas = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "exposureValue"')
      .addSelect('MAX(area."leadTime") AS "leadTime"')
      .where('key IN(:...keys)', {
        keys: [
          DynamicDataUnit.populationAffected,
          DynamicDataUnit.alertThreshold,
        ],
      })
      .andWhere('value > 0')
      .andWhere('date = current_date')
      .groupBy('area."placeCode"')
      .getRawMany();

    const existingUnclosedEventAreas = (
      await this.eventPlaceCodeRepo.find({
        where: { closed: false },
      })
    ).map(area => area.placeCode);
    const newEventAreas: EventPlaceCodeEntity[] = [];
    affectedAreas.forEach(area => {
      if (!existingUnclosedEventAreas.includes(area.placeCode)) {
        const eventArea = new EventPlaceCodeEntity();
        eventArea.placeCode = area.placeCode;
        eventArea.exposureValue = +area.populationAffected;
        eventArea.startDate = new Date();
        eventArea.endDate = this.getEndDate(area.leadTime);
        eventArea.activeTrigger = true;
        eventArea.closed = false;
        eventArea.manualClosedDate = null;
        newEventAreas.push(eventArea);
      }
    });
    await this.eventPlaceCodeRepo.save(newEventAreas);
  }

  private async closeEventsAutomatic() {
    const expiredEventAreas = await this.eventPlaceCodeRepo.find({
      where: { endDate: LessThan(new Date()) },
    });
    expiredEventAreas.forEach(area => (area.closed = true));
    await this.eventPlaceCodeRepo.save(expiredEventAreas);
  }

  private getEndDate(leadTime: LeadTime): Date {
    const today = new Date();
    return leadTime.includes('month')
      ? new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      : new Date(today.setDate(today.getDate() + 7));
  }
}
