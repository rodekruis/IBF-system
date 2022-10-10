import { EapActionsService } from './../eap-actions/eap-actions.service';
import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
/* eslint-disable @typescript-eslint/camelcase */
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ActivationLogDto,
  AffectedAreaDto,
  EventPlaceCodeDto,
} from './dto/event-place-code.dto';
import {
  LessThan,
  MoreThanOrEqual,
  Repository,
  In,
  MoreThan,
  IsNull,
} from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import {
  LeadTime,
  LeadTimeUnit,
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
import { HelperService } from '../../shared/helper.service';
import { UserEntity } from '../user/user.entity';

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
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  public constructor(
    private countryService: CountryService,
    private eapActionsService: EapActionsService,
    private helperService: HelperService,
  ) {}

  public async getEventSummaryCountry(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<EventSummaryCountry[]> {
    const eventSummary = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select(['area."countryCodeISO3"', 'event."eventName"'])
      .leftJoin('event.adminArea', 'area')
      .groupBy('area."countryCodeISO3"')
      .addGroupBy('event."eventName"')
      .addSelect([
        'to_char(MIN("startDate") , \'yyyy-mm-dd\') AS "startDate"',
        'to_char(MAX("endDate") , \'yyyy-mm-dd\') AS "endDate"',
        'MAX(event."activeTrigger"::int)::boolean AS "activeTrigger"',
        'MAX(event."thresholdReached"::int)::boolean AS "thresholdReached"',
      ])
      .where('closed = :closed', {
        closed: false,
      })
      .andWhere(
        // in case of 'typhoon' filter also on activeTrigger = true, thereby disabling old-event scenario
        '(event."disasterType" <> \'typhoon\' OR (event."disasterType" = \'typhoon\' AND event."activeTrigger" = true))',
      )
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('event."disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .getRawMany();
    return eventSummary;
  }

  public async getRecentDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<DateDto> {
    const result = await this.triggerPerLeadTimeRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3, disasterType: disasterType },
      order: { timestamp: 'DESC' },
    });
    if (result) {
      return {
        date: new Date(result.date).toISOString(),
        timestamp: new Date(result.timestamp),
      };
    } else {
      return {
        date: null,
        timestamp: null,
      };
    }
  }

  public async uploadTriggerPerLeadTime(
    uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    const triggersPerLeadTime: TriggerPerLeadTime[] = [];
    const timestamp = new Date();
    for (const leadTime of uploadTriggerPerLeadTimeDto.triggersPerLeadTime) {
      // Delete existing entries in case of a re-run of the pipeline for some reason
      await this.deleteDuplicates(uploadTriggerPerLeadTimeDto, leadTime);

      const triggerPerLeadTime = new TriggerPerLeadTime();
      triggerPerLeadTime.date = new Date();
      triggerPerLeadTime.timestamp = timestamp;
      triggerPerLeadTime.countryCodeISO3 =
        uploadTriggerPerLeadTimeDto.countryCodeISO3;
      triggerPerLeadTime.leadTime = leadTime.leadTime as LeadTime;
      triggerPerLeadTime.triggered = leadTime.triggered;
      triggerPerLeadTime.thresholdReached =
        leadTime.triggered && leadTime.thresholdReached;
      triggerPerLeadTime.disasterType =
        uploadTriggerPerLeadTimeDto.disasterType;
      triggerPerLeadTime.eventName = uploadTriggerPerLeadTimeDto.eventName;

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
    const leadTime = country.countryDisasterSettings.find(
      s => s.disasterType === uploadTriggerPerLeadTimeDto.disasterType,
    ).activeLeadTimes[0].leadTimeName;
    if (leadTime.includes(LeadTimeUnit.month)) {
      const date = new Date();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      await this.triggerPerLeadTimeRepository.delete({
        countryCodeISO3: uploadTriggerPerLeadTimeDto.countryCodeISO3,
        leadTime: selectedLeadTime.leadTime as LeadTime,
        disasterType: uploadTriggerPerLeadTimeDto.disasterType,
        eventName: uploadTriggerPerLeadTimeDto.eventName || IsNull(),
        date: MoreThanOrEqual(firstDayOfMonth),
      });
    } else if (leadTime.includes(LeadTimeUnit.hour)) {
      // Do not overwrite based on 'leadTime' as typhoon should also overwrite if lead-time has changed (as it's a calculated field, instead of fixed)
      await this.triggerPerLeadTimeRepository.delete({
        countryCodeISO3: uploadTriggerPerLeadTimeDto.countryCodeISO3,
        disasterType: uploadTriggerPerLeadTimeDto.disasterType,
        eventName: uploadTriggerPerLeadTimeDto.eventName || IsNull(),
        date: new Date(),
        timestamp: MoreThanOrEqual(
          this.helperService.getLast12hourInterval(
            uploadTriggerPerLeadTimeDto.disasterType,
          ),
        ),
      });
    } else {
      await this.triggerPerLeadTimeRepository.delete({
        countryCodeISO3: uploadTriggerPerLeadTimeDto.countryCodeISO3,
        leadTime: selectedLeadTime.leadTime as LeadTime,
        disasterType: uploadTriggerPerLeadTimeDto.disasterType,
        eventName: uploadTriggerPerLeadTimeDto.eventName || IsNull(),
        date: new Date(),
      });
    }
  }

  public async getTriggerUnit(disasterType: DisasterType): Promise<string> {
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
    adminLevel: number,
    leadTime: string,
    eventName: string,
  ): Promise<TriggeredArea[]> {
    const lastTriggeredDate = await this.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const triggerUnit = await this.getTriggerUnit(disasterType);
    const triggeredAreasRaw = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select(['dynamic.placeCode AS "placeCode"'])
      .where({
        indicator: triggerUnit,
        value: MoreThan(0),
        leadTime: leadTime,
        adminLevel: adminLevel,
        disasterType: disasterType,
        countryCodeISO3: countryCodeISO3,
        eventName: eventName === 'no-name' ? IsNull() : eventName,
        date: lastTriggeredDate.date,
        timestamp: MoreThanOrEqual(
          this.helperService.getLast12hourInterval(
            disasterType,
            lastTriggeredDate.timestamp,
          ),
        ),
      })
      .execute();
    const triggeredPlaceCodes = triggeredAreasRaw.map(
      element => element.placeCode,
    );

    const triggeredAreasQuery = this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'event."actionsValue"',
        'event."eventPlaceCodeId"',
        'event."activeTrigger"',
        'event."stopped"',
        'event."startDate"',
        'event."manualStoppedDate" AS "stoppedDate"',
        '"user"."firstName" || \' \' || "user"."lastName" AS "displayName"',
      ])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.user', 'user')
      .where({
        closed: false,
        disasterType: disasterType,
        eventName: eventName === 'no-name' ? IsNull() : eventName,
      })
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .orderBy('event."actionsValue"', 'DESC');

    let triggeredAreas;

    if (triggeredPlaceCodes.length) {
      triggeredAreas = await triggeredAreasQuery
        .andWhere('area."placeCode" IN(:...placeCodes)', {
          placeCodes: triggeredPlaceCodes,
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
        eventName === 'no-name' ? null : eventName,
      );

      const parentAdminArea = await this.adminAreaRepository
        .createQueryBuilder('area')
        .leftJoin(
          AdminAreaEntity,
          'parent',
          'area."placeCodeParent" = parent."placeCode"',
        )
        .select('parent.name AS name')
        .where('area."placeCode" = :placeCode', { placeCode: area.placeCode })
        .getRawOne();

      area.nameParent = parentAdminArea.name;
    }
    return triggeredAreas;
  }

  public async getActivationLogData(
    countryCodeISO3: string,
    disasterType: string,
  ): Promise<ActivationLogDto[]> {
    const baseQuery = this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."countryCodeISO3" AS "countryCodeISO3"',
        'event."disasterType"',
        'COALESCE(event."eventName", \'no name\') AS "eventName"',
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'event."startDate"',
        'event.stopped as stopped',
        'case when event.stopped = true then event."manualStoppedDate" end as "stopDate"',
        'event.closed as closed',
        'case when event.closed = true then event."endDate" end as "endDate"',
        'disaster."actionsUnit" as "exposureIndicator"',
        'event."actionsValue" as "exposureValue"',
        'event."eventPlaceCodeId" as "databaseId"',
      ])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.disasterType', 'disaster')
      .where({ thresholdReached: true })
      .orderBy('event."startDate"', 'DESC')
      .addOrderBy('area."countryCodeISO3"', 'ASC')
      .addOrderBy('event."disasterType"', 'ASC')
      .addOrderBy('area."placeCode"', 'ASC');

    let result;
    if (countryCodeISO3 === 'all' || disasterType === 'all') {
      result = await baseQuery.getRawMany();
    } else {
      result = await baseQuery
        .andWhere('event."disasterType" = :disasterType', {
          disasterType: disasterType,
        })
        .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
          countryCodeISO3: countryCodeISO3,
        })
        .getRawMany();
    }

    if (!result.length) {
      return [new ActivationLogDto()];
    }

    return result;
  }

  public async getTriggerPerLeadtime(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
  ): Promise<object> {
    const lastTriggeredDate = await this.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const triggersPerLeadTime = await this.triggerPerLeadTimeRepository.find({
      where: {
        countryCodeISO3: countryCodeISO3,
        date: lastTriggeredDate.date,
        timestamp: MoreThanOrEqual(
          this.helperService.getLast12hourInterval(
            disasterType,
            lastTriggeredDate.timestamp,
          ),
        ),
        disasterType: disasterType,
        eventName: eventName === 'no-name' ? IsNull() : eventName,
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
        result[`${leadTimeUnit}-thresholdReached`] = String(
          Number(leadTimeIsTriggered.thresholdReached),
        );
      }
    }
    return result;
  }

  public async stopTrigger(
    userId: string,
    eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      const errors = 'User not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    const eventPlaceCode = await this.eventPlaceCodeRepo.findOne(
      eventPlaceCodeDto.eventPlaceCodeId,
    );
    if (!eventPlaceCode) {
      const errors = 'Event placeCode not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    eventPlaceCode.stopped = true;
    eventPlaceCode.manualStoppedDate = new Date();
    eventPlaceCode.user = user;
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
    adminLevel: number,
    eventName: string,
    trigger: boolean,
  ): Promise<void> {
    // First set all events to inactive
    await this.setAllEventsToInactive(countryCodeISO3, disasterType);

    // update active ones to true + update population and end_date
    await this.updateExistingEventAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
    );

    // add new ones
    await this.addNewEventAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
    );

    // close old events
    await this.closeEventsAutomatic(countryCodeISO3, disasterType);
  }

  private async setAllEventsToInactive(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    const countryAdminAreaIds = await this.getCountryAdminAreaIds(
      countryCodeISO3,
    );
    // only set records that are not updated yet in this sequence of pipeline runs (e.g. multiple events in 1 day)
    // after the 1st event this means everything is updated ..
    // .. and from the 2nd event onwards if will not be set to activeTrigger=false again ..
    const cutoffDate = this.helperService.getLast12hourInterval(disasterType);
    const endDate = await this.getEndDate(disasterType, cutoffDate);

    // .. but only check on endDate if eventName is not null
    const eventAreas = await this.eventPlaceCodeRepo.find({
      where: [
        {
          adminArea: { id: In(countryAdminAreaIds) },
          disasterType: disasterType,
          endDate: LessThan(endDate),
        },
        {
          adminArea: { id: In(countryAdminAreaIds) },
          disasterType: disasterType,
          eventName: IsNull(),
        },
      ],
    });

    for await (const area of eventAreas) {
      area.activeTrigger = false;
    }
    await this.eventPlaceCodeRepo.save(eventAreas);
  }

  private async getAffectedAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
  ): Promise<AffectedAreaDto[]> {
    const triggerUnit = await this.getTriggerUnit(disasterType);

    const lastTriggeredDate = await this.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

    const whereFilters = {
      indicator: triggerUnit,
      date: lastTriggeredDate.date,
      timestamp: MoreThanOrEqual(
        this.helperService.getLast12hourInterval(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
      countryCodeISO3: countryCodeISO3,
      adminLevel: adminLevel,
      disasterType: disasterType,
      eventName: eventName || IsNull(),
    };

    const triggeredPlaceCodes = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "triggerValue"')
      .where(whereFilters)
      .andWhere('(area.value > 0 OR area."eventName" is not null)') // Also allow value=0 entries that have an event-name (= typhoon below trigger)
      .groupBy('area."placeCode"')
      .getRawMany();

    const triggerPlaceCodesArray = triggeredPlaceCodes.map(a => a.placeCode);

    if (triggerPlaceCodesArray.length === 0) {
      return [];
    }

    const actionUnit = await this.getActionUnit(disasterType);

    const whereOptions = {
      placeCode: In(triggerPlaceCodesArray),
      indicator: actionUnit,
      date: lastTriggeredDate.date,
      timestamp: MoreThanOrEqual(
        this.helperService.getLast12hourInterval(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
      countryCodeISO3: countryCodeISO3,
      adminLevel: adminLevel,
      disasterType: disasterType,
    };
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }

    const affectedAreas: AffectedAreaDto[] = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "actionsValue"')
      .addSelect('MAX(area."leadTime") AS "leadTime"')
      .where(whereOptions)
      .andWhere('(area.value > 0 OR area."eventName" is not null)') // Also allow value=0 entries that have an event-name (= typhoon below trigger)
      .groupBy('area."placeCode"')
      .getRawMany();

    for (const area of affectedAreas) {
      area.triggerValue = triggeredPlaceCodes.find(
        p => p.placeCode === area.placeCode,
      ).triggerValue;
    }

    return affectedAreas;
  }

  private async updateExistingEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
  ): Promise<void> {
    const affectedAreas = await this.getAffectedAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
    );
    const affectedAreasPlaceCodes = affectedAreas.map(area => area.placeCode);
    const countryAdminAreaIds = await this.getCountryAdminAreaIds(
      countryCodeISO3,
    );
    const unclosedEventAreas = await this.eventPlaceCodeRepo.find({
      where: {
        closed: false,
        adminArea: In(countryAdminAreaIds),
        disasterType: disasterType,
        eventName: eventName || IsNull(),
      },
      relations: ['adminArea'],
    });

    // To optimize performance here ..
    const idsToUpdateAboveThreshold = [];
    const idsToUpdateBelowThreshold = [];
    const endDate = await this.getEndDate(disasterType);
    unclosedEventAreas.forEach(eventArea => {
      const affectedArea = affectedAreas.find(
        area => area.placeCode === eventArea.adminArea.placeCode,
      );
      eventArea.activeTrigger = true;
      eventArea.endDate = endDate;
      if (affectedArea.triggerValue > 0) {
        eventArea.thresholdReached = true;
        idsToUpdateAboveThreshold.push(eventArea.eventPlaceCodeId);
      } else {
        eventArea.thresholdReached = false;
        idsToUpdateBelowThreshold.push(eventArea.eventPlaceCodeId);
      }
    });
    // .. first fire one query to update all rows that need thresholdReached = true
    await this.updateEvents(idsToUpdateAboveThreshold, true, endDate);

    // .. then fire one query to update all rows that need thresholdReached = false
    await this.updateEvents(idsToUpdateBelowThreshold, false, endDate);

    // .. and lastly fire individual queries to update actionsValue ONLY for rows here it changed
    let affectedArea: AffectedAreaDto;
    const eventAreasToUpdate = [];
    for await (const unclosedEventArea of unclosedEventAreas) {
      if (
        affectedAreasPlaceCodes.includes(unclosedEventArea.adminArea.placeCode)
      ) {
        affectedArea = affectedAreas.find(
          area => area.placeCode === unclosedEventArea.adminArea.placeCode,
        );
        if (unclosedEventArea.actionsValue !== affectedArea.actionsValue) {
          unclosedEventArea.actionsValue = affectedArea.actionsValue;
          eventAreasToUpdate.push(unclosedEventArea);
        }
      }
    }
    await this.eventPlaceCodeRepo.save(unclosedEventAreas);
  }

  private async updateEvents(
    eventPlaceCodeIds: string[],
    aboveThreshold: boolean,
    endDate: Date,
  ) {
    await this.eventPlaceCodeRepo
      .createQueryBuilder()
      .update()
      .set({
        activeTrigger: true,
        thresholdReached: aboveThreshold,
        endDate: endDate,
      })
      .where({ eventPlaceCodeId: In(eventPlaceCodeIds) })
      .execute();
  }

  private async addNewEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
  ): Promise<void> {
    const affectedAreas = await this.getAffectedAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
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
          eventName: eventName || IsNull(),
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
        eventArea.eventName = eventName;
        eventArea.thresholdReached = area.triggerValue > 0;
        eventArea.actionsValue = +area.actionsValue;
        eventArea.startDate = new Date();
        eventArea.endDate = await this.getEndDate(disasterType);
        eventArea.activeTrigger = true;
        eventArea.stopped = false;
        eventArea.manualStoppedDate = null;
        eventArea.disasterType = disasterType;
        newEventAreas.push(eventArea);
      }
    }
    await this.eventPlaceCodeRepo.save(newEventAreas);
  }

  private async closeEventsAutomatic(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    const countryAdminAreaIds = await this.getCountryAdminAreaIds(
      countryCodeISO3,
    );
    const expiredEventAreas = await this.eventPlaceCodeRepo.find({
      where: {
        endDate: LessThan(new Date()),
        adminArea: In(countryAdminAreaIds),
        disasterType: disasterType,
      },
    });
    expiredEventAreas.forEach(area => (area.closed = true));
    await this.eventPlaceCodeRepo.save(expiredEventAreas);
  }

  private async getEndDate(
    disasterType: DisasterType,
    passedDate?: Date,
  ): Promise<Date> {
    const today = passedDate || new Date();
    const disasterTypeEntity = await this.disasterTypeRepository.findOne({
      where: { disasterType: disasterType },
      relations: ['leadTimes'],
    });
    return disasterTypeEntity.leadTimes[0].leadTimeName.includes(
      LeadTimeUnit.month,
    )
      ? new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      : new Date(today.setDate(today.getDate() + 7));
  }
}
