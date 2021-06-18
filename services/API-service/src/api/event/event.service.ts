import { EapActionsService } from './../eap-actions/eap-actions.service';
import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
/* eslint-disable @typescript-eslint/camelcase */
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventPlaceCodeDto } from './dto/event-place-code.dto';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { UploadTriggerPerLeadTimeDto } from './dto/upload-trigger-per-leadtime.dto';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { EventSummaryCountry, TriggeredArea } from '../../shared/data.model';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryService } from '../country/country.service';

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

  private countryService: CountryService;
  private eapActionsService: EapActionsService;
  public constructor(
    countryService: CountryService,
    eapActionsService: EapActionsService,
  ) {
    this.countryService = countryService;
    this.eapActionsService = eapActionsService;
  }

  public async getEventSummaryCountry(
    countryCodeISO3: string,
  ): Promise<EventSummaryCountry> {
    const eventSummary = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select('area."countryCodeISO3"')
      .leftJoin(AdminAreaEntity, 'area', 'area.placeCode = event.placeCode')
      .groupBy('area."countryCodeISO3"')
      .addSelect([
        'to_char(MAX("startDate") , \'yyyy-mm-dd\') AS "startDate"',
        'to_char(MAX("endDate") , \'yyyy-mm-dd\') AS "endDate"',
        'MAX(event."activeTrigger"::int)::boolean AS "activeTrigger"',
      ])
      .where('closed = :closed', {
        closed: false,
      })
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .getRawOne();
    return eventSummary;
  }

  public async getRecentDates(countryCodeISO3: string): Promise<object[]> {
    const result = await this.triggerPerLeadTimeRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3 },
      order: { date: 'DESC' },
    });
    if (!result) {
      return [];
    }
    return [{ date: new Date(result.date).toISOString() }];
  }

  public async uploadTriggerPerLeadTime(
    uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    const triggersPerLeadTime: TriggerPerLeadTime[] = [];
    for (const leadTime of uploadTriggerPerLeadTimeDto.triggersPerLeadTime) {
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

  public async getTriggeredAreas(
    countryCodeISO3: string,
  ): Promise<TriggeredArea[]> {
    const triggeredAreas = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'event."placeCode"',
        'area.name AS name',
        'event."actionsValue"',
        'event."eventPlaceCodeId"',
        'event."activeTrigger"',
      ])
      .leftJoin(AdminAreaEntity, 'area', 'area.placeCode = event.placeCode')
      .where('closed = :closed', {
        closed: false,
      })
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .orderBy('event."actionsValue"', 'DESC')
      .getRawMany();
    for (const area of triggeredAreas) {
      area.eapActions = await this.eapActionsService.getActionsWithStatus(
        countryCodeISO3,
        area.placeCode,
      );
    }
    return triggeredAreas;
  }

  public async getTriggerPerLeadtime(countryCodeISO3: string): Promise<object> {
    const latestDate = await this.getOneMaximumTriggerDate(countryCodeISO3);
    const triggersPerLeadTime = await this.triggerPerLeadTimeRepository.find({
      where: { countryCodeISO3: countryCodeISO3, date: latestDate },
    });
    if (triggersPerLeadTime.length === 0) {
      return;
    }
    const result = {};
    result['date'] = triggersPerLeadTime[0].date;
    result['countryCodeISO3'] = triggersPerLeadTime[0].countryCodeISO3;
    for (const leadTimeKey in LeadTime) {
      const leadTimeUnit = LeadTime[leadTimeKey];
      const leadTimeIsTriggered = triggersPerLeadTime.find(
        (el): boolean => el.leadTime === leadTimeUnit,
      );
      if (leadTimeIsTriggered) {
        result[leadTimeUnit] = String(Number(leadTimeIsTriggered.triggered));
      } else {
        result[leadTimeUnit] = '0';
      }
    }
    return result;
  }

  private async getOneMaximumTriggerDate(countryCodeISO3): Promise<Date> {
    const result = await this.triggerPerLeadTimeRepository.findOne({
      order: { date: 'DESC' },
      where: { countryCodeISO3: countryCodeISO3 },
    });
    return result.date;
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

  public async processEventAreas(countryCodeISO3: string): Promise<void> {
    // set all events to activeTrigger=false
    const eventAreas = await this.eventPlaceCodeRepo.find();
    eventAreas.forEach(area => (area.activeTrigger = false));
    await this.eventPlaceCodeRepo.save(eventAreas);

    // update active ones to true + update population and end_date
    await this.updateExistingEventAreas(countryCodeISO3);

    // add new ones
    await this.addNewEventAreas(countryCodeISO3);

    // close old events
    await this.closeEventsAutomatic();
  }

  private async getAffectedAreas(countryCodeISO3: string): Promise<any[]> {
    const triggerIndicators = await this.countryService.getTriggerUnitsForCountry(
      countryCodeISO3,
    );

    const triggeredPlaceCodes = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .where('indicator IN(:...indicators)', {
        indicators: triggerIndicators,
      })
      .andWhere('value > 0')
      .andWhere('date = current_date')
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .groupBy('area."placeCode"')
      .getRawMany();

    const triggerPlaceCodesArray = triggeredPlaceCodes.map(a => a.placeCode);
    if (triggerPlaceCodesArray.length === 0) {
      return [];
    }

    const actionIndicatorsCountry = await this.countryService.getActionsUnitsForCountry(
      countryCodeISO3,
    );
    const q = this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "actionsValue"')
      .addSelect('MAX(area."leadTime") AS "leadTime"')
      .where('"placeCode" IN(:...placeCodes)', {
        placeCodes: triggerPlaceCodesArray,
      })
      .andWhere('indicator IN(:...indicators)', {
        indicators: actionIndicatorsCountry,
      })
      .andWhere('value > 0')
      .andWhere('date = current_date')
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .groupBy('area."placeCode"');
    return await q.getRawMany();
  }

  private async updateExistingEventAreas(
    countryCodeISO3: string,
  ): Promise<void> {
    const affectedAreas = await this.getAffectedAreas(countryCodeISO3);
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
        unclosedEventArea.actionsValue = affectedArea.actionsValue;
        unclosedEventArea.endDate = this.getEndDate(affectedArea.leadTime);
      }
    });
    await this.eventPlaceCodeRepo.save(unclosedEventAreas);
  }

  private async addNewEventAreas(countryCodeISO3: string): Promise<void> {
    const affectedAreas = await this.getAffectedAreas(countryCodeISO3);

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
        eventArea.actionsValue = +area.actionsValue;
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
