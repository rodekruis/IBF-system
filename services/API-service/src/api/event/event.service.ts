import { EapActionsService } from './../eap-actions/eap-actions.service';
import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
/* eslint-disable @typescript-eslint/camelcase */
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ActivationLogDto,
  EventPlaceCodeDto,
} from './dto/event-place-code.dto';
import { LessThan, MoreThanOrEqual, Repository, In } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import {
  LeadTime,
  LeadTimeDayMonth,
} from '../admin-area-dynamic-data/enum/lead-time.enum';
import { UploadTriggerPerLeadTimeDto } from './dto/upload-trigger-per-leadtime.dto';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { EventSummaryCountry, TriggeredArea } from '../../shared/data.model';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryService } from '../country/country.service';
import { DateDto } from './dto/date.dto';
import { TriggerPerLeadTimeDto } from './dto/trigger-per-leadtime.dto';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';

@Injectable()
export class EventService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<
    AdminAreaDynamicDataEntity
  >;
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;
  @InjectRepository(TriggerPerLeadTime)
  private readonly triggerPerLeadTimeRepository: Repository<TriggerPerLeadTime>;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;

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
    disasterType: DisasterType,
  ): Promise<EventSummaryCountry> {
    const eventSummary = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select('area."countryCodeISO3"')
      .leftJoin('event.adminArea', 'area')
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
      .andWhere('event."disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .getRawOne();
    return eventSummary;
  }

  public async getTotalAffectedPerLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
  ): Promise<number> {
    const lastTriggeredDate = await this.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const actionUnit = await this.getActionUnit(disasterType);

    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select('SUM(value)', 'totalAffected')
      .where('indicator = :indicator', {
        indicator: actionUnit,
      })
      .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
      .andWhere('"disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .andWhere('"countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .getRawOne();

    return result.totalAffected;
  }

  public async getRecentDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<DateDto> {
    const result = await this.triggerPerLeadTimeRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3, disasterType: disasterType },
      order: { date: 'DESC' },
    });
    return { date: new Date(result.date).toISOString() };
  }

  public async uploadTriggerPerLeadTime(
    uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    const triggersPerLeadTime: TriggerPerLeadTime[] = [];
    for (const leadTime of uploadTriggerPerLeadTimeDto.triggersPerLeadTime) {
      // Delete duplicates
      await this.deleteDuplicates(uploadTriggerPerLeadTimeDto, leadTime);
      const triggerPerLeadTime = new TriggerPerLeadTime();
      triggerPerLeadTime.date = new Date();
      triggerPerLeadTime.countryCodeISO3 =
        uploadTriggerPerLeadTimeDto.countryCodeISO3;
      triggerPerLeadTime.leadTime = leadTime.leadTime as LeadTime;
      triggerPerLeadTime.triggered = leadTime.triggered;
      triggerPerLeadTime.disasterType =
        uploadTriggerPerLeadTimeDto.disasterType;

      triggersPerLeadTime.push(triggerPerLeadTime);
    }

    await this.triggerPerLeadTimeRepository.save(triggersPerLeadTime);
  }

  private async deleteDuplicates(
    uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
    selectedLeadTime: TriggerPerLeadTimeDto,
  ): Promise<void> {
    const country = await this.countryService.findOne(
      uploadTriggerPerLeadTimeDto.countryCodeISO3,
    );
    if (
      country.countryActiveLeadTimes[0].leadTimeName.includes(
        LeadTimeDayMonth.month,
      )
    ) {
      const date = new Date();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      await this.triggerPerLeadTimeRepository.delete({
        countryCodeISO3: uploadTriggerPerLeadTimeDto.countryCodeISO3,
        leadTime: selectedLeadTime.leadTime as LeadTime,
        disasterType: uploadTriggerPerLeadTimeDto.disasterType,
        date: MoreThanOrEqual(firstDayOfMonth),
      });
    } else {
      await this.triggerPerLeadTimeRepository.delete({
        countryCodeISO3: uploadTriggerPerLeadTimeDto.countryCodeISO3,
        leadTime: selectedLeadTime.leadTime as LeadTime,
        disasterType: uploadTriggerPerLeadTimeDto.disasterType,
        date: new Date(),
      });
    }
  }

  private async getTriggerUnit(disasterType: DisasterType): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['triggerUnit'],
        where: { disasterType: disasterType },
      })
    ).triggerUnit;
  }

  public async getTriggeredAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
  ): Promise<TriggeredArea[]> {
    const triggerUnit = await this.getTriggerUnit(disasterType);
    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select(['dynamic.placeCode'])
      .where('indicator = :indicator', { indicator: triggerUnit })
      .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
      .andWhere('value > 0')
      .andWhere('"disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .execute();
    const triggeredPlaceCodesLeadTime = result.map(
      element => element.dynamic_placeCode,
    );

    const triggeredAreasQuery = this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'event."actionsValue"',
        'event."eventPlaceCodeId"',
        'event."activeTrigger"',
      ])
      .leftJoin('event.adminArea', 'area')
      .where('closed = :closed', {
        closed: false,
      })
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('"disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .orderBy('event."actionsValue"', 'DESC');

    let triggeredAreas;

    if (triggeredPlaceCodesLeadTime.length) {
      triggeredAreas = await triggeredAreasQuery
        .andWhere('area."placeCode" IN(:...placeCodes)', {
          placeCodes: triggeredPlaceCodesLeadTime,
        })
        .getRawMany();
    } else {
      triggeredAreas = await triggeredAreasQuery.getRawMany();
    }

    for (const area of triggeredAreas) {
      area.eapActions = await this.eapActionsService.getActionsWithStatus(
        countryCodeISO3,
        disasterType,
        area.placeCode,
      );
    }
    return triggeredAreas;
  }

  public async getActivationLogData(): Promise<ActivationLogDto[]> {
    return await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."countryCodeISO3" AS "countryCodeISO3"',
        'event."disasterType"',
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'event."startDate"',
        'case when event."manualClosedDate" is not null and event.closed = true then event."manualClosedDate" when event.closed = true then event."endDate" else null end as "endDate"',
        'event.closed as closed',
        'case when event."manualClosedDate" is not null then true else false end AS "manuallyClosed"',
        'disaster."actionsUnit" as "exposureIndicator"',
        'event."actionsValue" as "exposureValue"',
        'event."eventPlaceCodeId" as "databaseId"',
      ])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.disasterType', 'disaster')
      .orderBy('area."countryCodeISO3"', 'ASC')
      .addOrderBy('event."disasterType"', 'ASC')
      .addOrderBy('area."placeCode"', 'ASC')
      .getRawMany();
  }

  public async getTriggerPerLeadtime(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<object> {
    const lastTriggeredDate = await this.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const triggersPerLeadTime = await this.triggerPerLeadTimeRepository.find({
      where: {
        countryCodeISO3: countryCodeISO3,
        date: lastTriggeredDate.date,
        disasterType: disasterType,
      },
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
      }
    }
    return result;
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

  public async getCountryAdminAreaIds(
    countryCodeISO3: string,
  ): Promise<string[]> {
    return (
      await this.adminAreaRepository.find({
        select: ['id'],
        where: { countryCodeISO3: countryCodeISO3 },
      })
    ).map(area => area.id);
  }

  private async getActionUnit(disasterType: DisasterType): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['actionsUnit'],
        where: { disasterType: disasterType },
      })
    ).actionsUnit;
  }

  public async processEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const countryAdminAreaIds = await this.getCountryAdminAreaIds(
      countryCodeISO3,
    );
    const eventAreas = await this.eventPlaceCodeRepo.find({
      where: {
        adminArea: { id: In(countryAdminAreaIds) },
        disasterType: disasterType,
      },
    });
    eventAreas.forEach(area => (area.activeTrigger = false));
    await this.eventPlaceCodeRepo.save(eventAreas);

    // update active ones to true + update population and end_date
    await this.updateExistingEventAreas(countryCodeISO3, disasterType);

    // add new ones
    await this.addNewEventAreas(countryCodeISO3, disasterType);

    // close old events
    await this.closeEventsAutomatic(countryCodeISO3);
  }

  private async getAffectedAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<any[]> {
    const triggerUnit = await this.getTriggerUnit(disasterType);

    const lastTriggeredDate = await this.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

    const triggeredPlaceCodes = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .where('indicator = :indicator', {
        indicator: triggerUnit,
      })
      .andWhere('value > 0')
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .groupBy('area."placeCode"')
      .getRawMany();

    const triggerPlaceCodesArray = triggeredPlaceCodes.map(a => a.placeCode);

    if (triggerPlaceCodesArray.length === 0) {
      return [];
    }

    const actionUnit = await this.getActionUnit(disasterType);

    const q = this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "actionsValue"')
      .addSelect('MAX(area."leadTime") AS "leadTime"')
      .where('"placeCode" IN(:...placeCodes)', {
        placeCodes: triggerPlaceCodesArray,
      })
      .andWhere('indicator = :indicator', {
        indicator: actionUnit,
      })
      .andWhere('value > 0')
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .groupBy('area."placeCode"');
    return await q.getRawMany();
  }

  private async updateExistingEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const affectedAreas = await this.getAffectedAreas(
      countryCodeISO3,
      disasterType,
    );
    const affectedAreasPlaceCodes = affectedAreas.map(area => area.placeCode);
    const countryAdminAreaIds = await this.getCountryAdminAreaIds(
      countryCodeISO3,
    );
    const unclosedEventAreas = await this.eventPlaceCodeRepo.find({
      where: { closed: false, adminArea: In(countryAdminAreaIds) },
      relations: ['adminArea'],
    });
    let affectedArea;
    unclosedEventAreas.forEach(unclosedEventArea => {
      if (
        affectedAreasPlaceCodes.includes(unclosedEventArea.adminArea.placeCode)
      ) {
        affectedArea = affectedAreas.find(
          area => area.placeCode === unclosedEventArea.adminArea.placeCode,
        );
        unclosedEventArea.activeTrigger = true;
        unclosedEventArea.actionsValue = affectedArea.actionsValue;
        unclosedEventArea.endDate = this.getEndDate(affectedArea.leadTime);
      }
    });
    await this.eventPlaceCodeRepo.save(unclosedEventAreas);
  }

  private async addNewEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const affectedAreas = await this.getAffectedAreas(
      countryCodeISO3,
      disasterType,
    );
    const countryAdminAreaIds = await this.getCountryAdminAreaIds(
      countryCodeISO3,
    );
    const existingUnclosedEventAreas = (
      await this.eventPlaceCodeRepo.find({
        where: {
          closed: false,
          adminArea: In(countryAdminAreaIds),
          disasterType: disasterType,
        },
        relations: ['adminArea'],
      })
    ).map(area => area.adminArea.placeCode);
    const newEventAreas: EventPlaceCodeEntity[] = [];
    for await (const area of affectedAreas) {
      if (!existingUnclosedEventAreas.includes(area.placeCode)) {
        const adminArea = await this.adminAreaRepository.findOne({
          where: { placeCode: area.placeCode },
        });
        const eventArea = new EventPlaceCodeEntity();
        eventArea.adminArea = adminArea;
        eventArea.actionsValue = +area.actionsValue;
        eventArea.startDate = new Date();
        eventArea.endDate = this.getEndDate(area.leadTime);
        eventArea.activeTrigger = true;
        eventArea.closed = false;
        eventArea.manualClosedDate = null;
        eventArea.disasterType = disasterType;
        newEventAreas.push(eventArea);
      }
    }
    await this.eventPlaceCodeRepo.save(newEventAreas);
  }

  private async closeEventsAutomatic(countryCodeISO3: string) {
    const countryAdminAreaIds = await this.getCountryAdminAreaIds(
      countryCodeISO3,
    );
    const expiredEventAreas = await this.eventPlaceCodeRepo.find({
      where: {
        endDate: LessThan(new Date()),
        adminArea: In(countryAdminAreaIds),
      },
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
