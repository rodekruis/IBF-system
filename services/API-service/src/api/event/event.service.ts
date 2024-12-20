import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { subDays } from 'date-fns';
import {
  DataSource,
  In,
  IsNull,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import {
  DisasterSpecificProperties,
  EventSummaryCountry,
  TriggeredArea,
} from '../../shared/data.model';
import { HelperService } from '../../shared/helper.service';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryDisasterSettingsEntity } from '../country/country-disaster.entity';
import { CountryEntity } from '../country/country.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import { UserEntity } from '../user/user.entity';
import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { EapActionsService } from './../eap-actions/eap-actions.service';
import { DateDto } from './dto/date.dto';
import {
  ActivationLogDto,
  AffectedAreaDto,
  EventPlaceCodeDto,
} from './dto/event-place-code.dto';
import { TriggerPerLeadTimeDto } from './dto/trigger-per-leadtime.dto';
import { UploadTriggerPerLeadTimeDto } from './dto/upload-trigger-per-leadtime.dto';
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';

@Injectable()
export class EventService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;
  @InjectRepository(TriggerPerLeadTime)
  private readonly triggerPerLeadTimeRepository: Repository<TriggerPerLeadTime>;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(
    private eapActionsService: EapActionsService,
    private helperService: HelperService,
    private dataSource: DataSource,
    private typhoonTrackService: TyphoonTrackService,
  ) {}
  public async getEventSummary(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<EventSummaryCountry[]> {
    const recentDate = await this.getRecentDate(countryCodeISO3, disasterType);
    const eventSummaryQueryBuilder = this.createEventSummaryQueryBuilder(
      countryCodeISO3,
    ).andWhere({
      closed: false,
      endDate: MoreThanOrEqual(recentDate.date),
      disasterType: disasterType,
    });
    return this.queryAndMapEventSummary(
      eventSummaryQueryBuilder,
      countryCodeISO3,
      disasterType,
    );
  }

  public async getEventsSummaryTriggerFinishedMail(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<EventSummaryCountry[]> {
    const adminAreaIds = await this.getCountryAdminAreaIds(countryCodeISO3);

    const sixDaysAgo = subDays(new Date(), 6); // NOTE: this 7-day rule is no longer applicable. Fix this when re-enabling this feature.
    const eventSummaryQueryBuilder = this.createEventSummaryQueryBuilder(
      countryCodeISO3,
    )
      .andWhere('event.endDate > :endDate', { endDate: sixDaysAgo })
      .andWhere('event.adminArea IN (:...adminAreaIds)', { adminAreaIds })
      .andWhere('event.disasterType = :disasterType', { disasterType })
      .andWhere('event.closed = :closed', { closed: true });

    return this.queryAndMapEventSummary(
      eventSummaryQueryBuilder,
      countryCodeISO3,
      disasterType,
    );
  }

  private async queryAndMapEventSummary(
    qb: SelectQueryBuilder<EventPlaceCodeEntity>,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<EventSummaryCountry[]> {
    const rawEventSummary = await qb.getRawMany();
    const eventSummary = await this.populateEventsDetails(
      rawEventSummary,
      countryCodeISO3,
      disasterType,
    );
    return eventSummary;
  }

  private async populateEventsDetails(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawEvents: any[],
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<EventSummaryCountry[]> {
    const disasterSettings = await this.getCountryDisasterSettings(
      countryCodeISO3,
      disasterType,
    );
    for (const event of rawEvents) {
      event.firstLeadTime = await this.getFirstLeadTime(
        countryCodeISO3,
        disasterType,
        event.eventName,
        false,
      );
      event.firstTriggerLeadTime = await this.getFirstLeadTime(
        countryCodeISO3,
        disasterType,
        event.eventName,
        true,
      );
      if (disasterType === DisasterType.Typhoon) {
        event.disasterSpecificProperties =
          await this.typhoonTrackService.getTyphoonSpecificProperties(
            countryCodeISO3,
            event.eventName,
          );
      }
      if (disasterType === DisasterType.Floods) {
        // REFACTOR: either make eapAlertClass a requirement across all hazard
        // types or reimplement such that eapAlertClass is not needed in the
        // backend (it is a VIEW of the DATA in the dashboard and email)
        event.disasterSpecificProperties = await this.getEventEapAlertClass(
          disasterSettings,
          event.triggerValue,
        );
      }
    }
    return rawEvents;
  }

  private createEventSummaryQueryBuilder(
    countryCodeISO3: string,
  ): SelectQueryBuilder<EventPlaceCodeEntity> {
    return this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select(['area."countryCodeISO3"', 'event."eventName"'])
      .leftJoin('event.adminArea', 'area')
      .groupBy('area."countryCodeISO3"')
      .addGroupBy('event."eventName"')
      .addSelect([
        'to_char(MIN("startDate") , \'yyyy-mm-dd\') AS "startDate"',
        'to_char(MAX("endDate") , \'yyyy-mm-dd\') AS "endDate"',
        'MAX(event."thresholdReached"::int)::boolean AS "thresholdReached"',
        'SUM(CASE WHEN event."actionsValue" > 0 OR event."triggerValue" > 0 THEN 1 ELSE 0 END) AS "nrAffectedAreas"', // This count is needed here, because the portal also needs the count of other events when in event view, which it cannot get any more from the triggeredAreas array length, which is then filtered on selected event only
        'MAX(event."triggerValue")::float AS "triggerValue"',
        'sum(event."actionsValue")::int AS "actionsValueSum"',
      ])
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      });
  }

  public async getRecentDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<DateDto> {
    return this.helperService.getRecentDate(countryCodeISO3, disasterType);
  }

  public async uploadTriggerPerLeadTime(
    uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ): Promise<void> {
    uploadTriggerPerLeadTimeDto.date =
      this.helperService.setDayToLastDayOfMonth(
        uploadTriggerPerLeadTimeDto.date,
        uploadTriggerPerLeadTimeDto.triggersPerLeadTime[0].leadTime,
      );
    const triggersPerLeadTime: TriggerPerLeadTime[] = [];
    const timestamp = uploadTriggerPerLeadTimeDto.date || new Date();
    for (const leadTime of uploadTriggerPerLeadTimeDto.triggersPerLeadTime) {
      // Delete existing entries in case of a re-run of the pipeline within the same time period
      await this.deleteDuplicates(uploadTriggerPerLeadTimeDto, leadTime);

      const triggerPerLeadTime = new TriggerPerLeadTime();
      triggerPerLeadTime.date = uploadTriggerPerLeadTimeDto.date || new Date();
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
    const deleteFilters = {
      countryCodeISO3: uploadTriggerPerLeadTimeDto.countryCodeISO3,
      disasterType: uploadTriggerPerLeadTimeDto.disasterType,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          uploadTriggerPerLeadTimeDto.disasterType,
          uploadTriggerPerLeadTimeDto.date,
        ),
      ),
    };
    if (uploadTriggerPerLeadTimeDto.eventName) {
      deleteFilters['eventName'] = uploadTriggerPerLeadTimeDto.eventName;
    }
    // Only filter on leadTime when using fixed LeadTime / not using events
    if (uploadTriggerPerLeadTimeDto.disasterType === DisasterType.HeavyRain) {
      deleteFilters['leadTime'] = selectedLeadTime.leadTime as LeadTime;
    }
    await this.triggerPerLeadTimeRepository.delete(deleteFilters);
  }

  private async deleteDuplicateEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    date: Date,
  ): Promise<void> {
    const countryAdminAreaIds =
      await this.getCountryAdminAreaIds(countryCodeISO3);
    const deleteFilters = {
      adminArea: In(countryAdminAreaIds),
      disasterType,
      startDate: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(disasterType, date),
      ),
    };
    if (eventName) {
      deleteFilters['eventName'] = eventName;
    }
    const eventAreasToDelete = await this.eventPlaceCodeRepo.find({
      where: deleteFilters,
    });
    await this.eventPlaceCodeRepo.remove(eventAreasToDelete);
  }

  public async getTriggerUnit(disasterType: DisasterType): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['triggerUnit'],
        where: { disasterType },
      })
    ).triggerUnit;
  }

  private async getCountryDisasterSettings(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    return (
      await this.countryRepository.findOne({
        where: { countryCodeISO3 },
        relations: ['countryDisasterSettings'],
      })
    ).countryDisasterSettings.find((d) => d.disasterType === disasterType);
  }

  public async getTriggeredAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
  ): Promise<TriggeredArea[]> {
    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const triggerUnit = await this.getTriggerUnit(disasterType);
    const defaultAdminLevel = (
      await this.getCountryDisasterSettings(countryCodeISO3, disasterType)
    ).defaultAdminLevel;

    const whereFiltersDynamicData = {
      indicator: triggerUnit, // REFACTOR: trigger unit and indicator should not be used interchangeably
      value: MoreThan(0),
      adminLevel,
      disasterType,
      countryCodeISO3,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
    };
    if (eventName) {
      whereFiltersDynamicData['eventName'] = eventName;
    }
    if (leadTime) {
      whereFiltersDynamicData['leadTime'] = leadTime;
    }
    const triggeredAreasRaw = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select(['dynamic.placeCode AS "placeCode"'])
      .where(whereFiltersDynamicData)
      .execute();
    const triggeredPlaceCodes = triggeredAreasRaw.map(
      (element) => element.placeCode,
    );

    if (adminLevel > defaultAdminLevel) {
      // Use this to also return something on deeper levels than default (to show in chat-section)
      return this.getDeeperTriggeredAreas(
        triggeredPlaceCodes,
        disasterType,
        lastTriggeredDate,
        eventName,
      );
    }

    const whereFiltersEvent = {
      closed: false,
      disasterType: disasterType,
    };
    if (eventName) {
      whereFiltersEvent['eventName'] = eventName;
    }
    const triggeredAreas = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'area."adminLevel" AS "adminLevel"',
        'event."actionsValue"',
        'event."triggerValue"',
        'event."eventPlaceCodeId"',
        'event."stopped"',
        'event."startDate"',
        'event."manualStoppedDate" AS "stoppedDate"',
        '"user"."firstName" || \' \' || "user"."lastName" AS "displayName"',
        'parent.name AS "nameParent"',
      ])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.user', 'user')
      .leftJoin(
        AdminAreaEntity,
        'parent',
        'area."placeCodeParent" = parent."placeCode"',
      )
      .where(whereFiltersEvent)
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('(event."actionsValue" > 0 OR event."triggerValue" > 0)')
      .orderBy('event."actionsValue"', 'DESC')
      .getRawMany();

    for (const area of triggeredAreas) {
      if (triggeredPlaceCodes.length === 0) {
        area.eapActions = [];
      } else if (area.triggerValue < 1) {
        // Do not show actions for below-trigger events/areas
        area.eapActions = [];
      } else {
        area.eapActions = await this.eapActionsService.getActionsWithStatus(
          countryCodeISO3,
          disasterType,
          area.placeCode,
          eventName,
        );
      }
    }
    return triggeredAreas;
  }

  private async getDeeperTriggeredAreas(
    triggeredPlaceCodes: string[],
    disasterType: DisasterType,
    lastTriggeredDate: DateDto,
    eventName?: string,
    leadTime?: string,
  ): Promise<TriggeredArea[]> {
    const actionUnit = await this.getActionUnit(disasterType);
    const whereFilters = {
      placeCode: In(triggeredPlaceCodes),
      indicator: actionUnit,
      disasterType,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
    };
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }
    if (leadTime) {
      whereFilters['leadTime'] = leadTime;
    }
    const areas = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .where(whereFilters)
      .leftJoinAndSelect(
        AdminAreaEntity,
        'area',
        'dynamic."placeCode" = area."placeCode"',
      )
      // add parent event (for data on 'stopped' areas 1 level deeper than default)
      .leftJoin(
        AdminAreaEntity,
        'parent',
        'area."placeCodeParent" = parent."placeCode"',
      )
      .leftJoin('parent.eventPlaceCodes', 'parentEvent')
      .leftJoin('parentEvent.user', 'parentUser')
      // add grandparent event (for data on 'stopped' areas 2 levels deeper than default)
      .leftJoin(
        AdminAreaEntity,
        'grandparent',
        'parent."placeCodeParent" = grandparent."placeCode"',
      )
      .leftJoin('grandparent.eventPlaceCodes', 'grandparentEvent')
      .leftJoin('grandparentEvent.user', 'grandparentUser')
      .select([
        'dynamic."placeCode" AS "placeCode"',
        'area.name AS name',
        'area."adminLevel" AS "adminLevel"',
        'dynamic.value AS value',
        'COALESCE("parentEvent"."startDate","grandparentEvent"."startDate") AS "startDate"',
        'COALESCE(parentEvent.stopped,"grandparentEvent".stopped) AS stopped',
        'COALESCE("parentEvent"."manualStoppedDate","grandparentEvent"."manualStoppedDate") AS "stoppedDate"',
        'COALESCE("parentUser"."firstName","grandparentUser"."firstName") || \' \' || COALESCE("parentUser"."lastName","grandparentUser"."lastName") AS "displayName"',
      ])
      .getRawMany();

    return areas.map((area) => {
      return {
        placeCode: area.placeCode,
        name: area.name,
        nameParent: null,
        actionsValue: area.value,
        triggerValue: null, // leave empty for now, as we don't show triggerValue on deeper levels
        stopped: area.stopped,
        startDate: area.startDate,
        stoppedDate: area.stoppedDate,
        displayName: area.displayName,
        eapActions: [],
      };
    });
  }

  public async getActivationLogData(
    countryCodeISO3?: string,
    disasterType?: string,
  ): Promise<ActivationLogDto[]> {
    let baseQuery = this.eventPlaceCodeRepo
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
        `CASE event."triggerValue" WHEN 1 THEN 'Trigger/alert' WHEN 0.7 THEN 'Medium warning' WHEN 0.3 THEN 'Low warning' END as "alertClass"`,
        'event."eventPlaceCodeId" as "databaseId"',
      ])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.disasterType', 'disaster')
      .where({ triggerValue: MoreThan(0) })
      .orderBy('event."startDate"', 'DESC')
      .addOrderBy('area."countryCodeISO3"', 'ASC')
      .addOrderBy('event."disasterType"', 'ASC')
      .addOrderBy('area."placeCode"', 'ASC');

    if (countryCodeISO3 && disasterType) {
      baseQuery = baseQuery
        .andWhere('event."disasterType" = :disasterType', {
          disasterType: disasterType,
        })
        .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
          countryCodeISO3: countryCodeISO3,
        });
    }
    const activationLogData = await baseQuery.getRawMany();

    if (!activationLogData.length) {
      return [new ActivationLogDto()];
    }

    return activationLogData;
  }

  private async getFirstLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    triggeredLeadTime: boolean,
  ) {
    const timesteps = await this.getTriggerPerLeadtime(
      countryCodeISO3,
      disasterType,
      eventName,
    );
    let firstKey = null;
    if (timesteps) {
      Object.keys(timesteps)
        .filter((key) => Object.values(LeadTime).includes(key as LeadTime))
        .sort((a, b) =>
          Number(a.split('-')[0]) > Number(b.split('-')[0]) ? 1 : -1,
        )
        .forEach((key) => {
          if (triggeredLeadTime) {
            if (timesteps[`${key}-thresholdReached`] === '1') {
              firstKey = !firstKey ? key : firstKey;
            }
          } else {
            if (timesteps[key] === '1') {
              firstKey = !firstKey ? key : firstKey;
            }
          }
        });
    }
    return firstKey;
  }

  public async getTriggerPerLeadtime(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
  ): Promise<object> {
    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const whereFilters = {
      countryCodeISO3,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
      disasterType,
    };
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }

    // get max per leadTime (for multi-event case national view)
    const triggersPerLeadTime = await this.triggerPerLeadTimeRepository
      .createQueryBuilder('triggerPerLeadTime')
      .select([
        'triggerPerLeadTime.leadTime as "leadTime"',
        'triggerPerLeadTime.date as date',
        'MAX(CASE WHEN triggerPerLeadTime.triggered = TRUE THEN 1 ELSE 0 END) as triggered',
        'MAX(CASE WHEN triggerPerLeadTime.thresholdReached = TRUE THEN 1 ELSE 0 END) as "thresholdReached"',
      ])
      .where(whereFilters)
      .groupBy('triggerPerLeadTime.leadTime')
      .addGroupBy('triggerPerLeadTime.date')
      .getRawMany();

    if (triggersPerLeadTime.length === 0) {
      return;
    }
    const result = {
      date: triggersPerLeadTime[0].date,
    };
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

  public async toggleStoppedTrigger(
    userId: string,
    eventPlaceCodeDto: EventPlaceCodeDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });
    if (!user) {
      const errors = 'User not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    const eventPlaceCode = await this.eventPlaceCodeRepo.findOne({
      where: { eventPlaceCodeId: eventPlaceCodeDto.eventPlaceCodeId },
    });
    if (!eventPlaceCode) {
      const errors = 'Event placeCode not found';
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    eventPlaceCode.stopped = !eventPlaceCode.stopped;
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
    ).map((area) => area.id);
  }

  private async getActionUnit(disasterType: DisasterType): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['actionsUnit'],
        where: { disasterType },
      })
    ).actionsUnit;
  }

  public async processEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
    date: Date,
  ): Promise<void> {
    // First delete duplicate events for upload within same time-block
    await this.deleteDuplicateEvents(
      countryCodeISO3,
      disasterType,
      eventName,
      date,
    );

    // update existing event areas + update population and end_date
    await this.updateExistingEventAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
    );

    // add new event areas
    await this.addNewEventAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
    );

    // close old event areas
    // NOTE: this has been replaced by a separate endpoint, to be called at the end of a pipeline run, so that it's called only once instead of per event
    // await this.closeEventsAutomatic(countryCodeISO3, disasterType, eventName);
  }

  private async getAffectedAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
  ): Promise<AffectedAreaDto[]> {
    const triggerUnit = await this.getTriggerUnit(disasterType);

    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

    const whereFilters = {
      indicator: triggerUnit, // REFACTOR: trigger unit and indicator should not be used interchangeably
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
      countryCodeISO3,
      adminLevel,
      disasterType,
      eventName: eventName || IsNull(),
    };

    const triggeredPlaceCodes = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "triggerValue"')
      .where(whereFilters)
      .andWhere(
        `(area.value > 0 OR (area."eventName" is not null AND area."disasterType" IN ('flash-floods','typhoon')))`,
      ) // Also allow value=0 entries with typhoon/flash-floods and event name (= below trigger event)
      .groupBy('area."placeCode"')
      .getRawMany();

    const triggerPlaceCodesArray = triggeredPlaceCodes.map((a) => a.placeCode);

    if (triggerPlaceCodesArray.length === 0) {
      return [];
    }

    const actionUnit = await this.getActionUnit(disasterType);

    const whereOptions = {
      placeCode: In(triggerPlaceCodesArray),
      indicator: actionUnit, // REFACTOR: action unit and indicator should not be used interchangeably
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
      countryCodeISO3,
      adminLevel,
      disasterType,
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
      .groupBy('area."placeCode"')
      .getRawMany();

    for (const area of affectedAreas) {
      area.triggerValue = triggeredPlaceCodes.find(
        ({ placeCode }) => placeCode === area.placeCode,
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
    const countryAdminAreaIds =
      await this.getCountryAdminAreaIds(countryCodeISO3);
    const unclosedEventAreas = await this.eventPlaceCodeRepo.find({
      where: {
        closed: false,
        adminArea: In(countryAdminAreaIds),
        disasterType,
        eventName: eventName || IsNull(),
      },
      relations: ['adminArea'],
    });

    // To optimize performance here ..
    const idsToUpdateAboveThreshold = [];
    const idsToUpdateBelowThreshold = [];
    const uploadDate = await this.getRecentDate(countryCodeISO3, disasterType);
    unclosedEventAreas.forEach((eventArea) => {
      const affectedArea = affectedAreas.find(
        (area) => area.placeCode === eventArea.adminArea.placeCode,
      );
      if (affectedArea) {
        eventArea.endDate = uploadDate.timestamp;
        if (affectedArea.triggerValue === 1) {
          eventArea.thresholdReached = true;
          idsToUpdateAboveThreshold.push(eventArea.eventPlaceCodeId);
        } else {
          eventArea.thresholdReached = false;
          idsToUpdateBelowThreshold.push(eventArea.eventPlaceCodeId);
        }
      }
    });
    // .. first fire one query to update all rows that need thresholdReached = true
    await this.updateEvents(
      idsToUpdateAboveThreshold,
      true,
      uploadDate.timestamp,
    );

    // .. then fire one query to update all rows that need thresholdReached = false
    await this.updateEvents(
      idsToUpdateBelowThreshold,
      false,
      uploadDate.timestamp,
    );

    // .. lastly we update those records where actionsValue or triggerValue changed
    await this.updateValues(unclosedEventAreas, affectedAreas);
  }

  private async updateEvents(
    eventPlaceCodeIds: string[],
    thresholdReached: boolean,
    endDate: Date,
  ) {
    if (eventPlaceCodeIds.length) {
      await this.eventPlaceCodeRepo
        .createQueryBuilder()
        .update()
        .set({ thresholdReached, endDate })
        .where({ eventPlaceCodeId: In(eventPlaceCodeIds) })
        .execute();
    }
  }

  private async updateValues(
    unclosedEventAreas: EventPlaceCodeEntity[],
    affectedAreas: AffectedAreaDto[],
  ) {
    let affectedArea: AffectedAreaDto;
    const eventAreasToUpdate = [];
    for await (const eventArea of unclosedEventAreas) {
      affectedArea = affectedAreas.find(
        (area) => area.placeCode === eventArea.adminArea.placeCode,
      );
      if (
        affectedArea &&
        (eventArea.actionsValue !== affectedArea.actionsValue ||
          eventArea.triggerValue !== affectedArea.triggerValue)
      ) {
        eventArea.triggerValue = affectedArea.triggerValue;
        eventArea.actionsValue = affectedArea.actionsValue;
        eventAreasToUpdate.push(
          `('${eventArea.eventPlaceCodeId}',${eventArea.actionsValue},${eventArea.triggerValue})`,
        );
      }
    }
    if (eventAreasToUpdate.length) {
      const repository = this.dataSource.getRepository(EventPlaceCodeEntity);
      const updateQuery = `UPDATE \
      "${repository.metadata.schema}"."${repository.metadata.tableName}" epc \
      SET \
          "actionsValue" = areas.actionValue::double precision, \
          "triggerValue" = areas.triggerValue::double precision \
      FROM \
         (VALUES ${eventAreasToUpdate.join(',')}) \
         areas(id, actionValue, triggerValue) \
      WHERE \
          areas.id::uuid = epc."eventPlaceCodeId" \
      `;
      await this.dataSource.query(updateQuery);
    }
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
    const countryAdminAreaIds =
      await this.getCountryAdminAreaIds(countryCodeISO3);
    const existingUnclosedEventAreas = (
      await this.eventPlaceCodeRepo.find({
        where: {
          closed: false,
          adminArea: In(countryAdminAreaIds),
          disasterType,
          eventName: eventName || IsNull(),
        },
        relations: ['adminArea'],
      })
    ).map((area) => area.adminArea.placeCode);
    const newEventAreas: EventPlaceCodeEntity[] = [];
    const startDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    for await (const area of affectedAreas) {
      if (!existingUnclosedEventAreas.includes(area.placeCode)) {
        const adminArea = await this.adminAreaRepository.findOne({
          where: { placeCode: area.placeCode },
        });
        const eventArea = new EventPlaceCodeEntity();
        eventArea.adminArea = adminArea;
        eventArea.eventName = eventName;
        eventArea.thresholdReached = area.triggerValue === 1;
        eventArea.triggerValue = area.triggerValue;
        eventArea.actionsValue = +area.actionsValue;
        eventArea.startDate = startDate.timestamp;
        eventArea.endDate = startDate.timestamp;
        eventArea.stopped = false;
        eventArea.manualStoppedDate = null;
        eventArea.disasterType = disasterType;
        newEventAreas.push(eventArea);
      }
    }
    await this.eventPlaceCodeRepo.save(newEventAreas);
  }

  public async closeEventsAutomatic(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    const countryAdminAreaIds =
      await this.getCountryAdminAreaIds(countryCodeISO3);
    const uploadDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const where = {
      endDate: LessThan(uploadDate.timestamp), // If the area was not prolonged earlier, then the endDate is not updated and is therefore less than the uploadDate
      adminArea: In(countryAdminAreaIds),
      disasterType,
      closed: false,
    };
    const expiredEventAreas = await this.eventPlaceCodeRepo.find({ where });

    // Below trigger threshold events can be removed from this table after closing
    // Below trigger threshold events are warnings an not triggered. I do not know why they are removed here
    const belowThresholdEvents = expiredEventAreas.filter(
      ({ thresholdReached }) => !thresholdReached,
    );
    await this.eventPlaceCodeRepo.remove(belowThresholdEvents);

    //For the other ones update 'closed = true'
    const aboveThresholdEvents = expiredEventAreas.filter(
      ({ thresholdReached }) => thresholdReached,
    );
    for (const area of aboveThresholdEvents) {
      area.closed = true;
    }
    await this.eventPlaceCodeRepo.save(aboveThresholdEvents);
  }

  private async getEventEapAlertClass(
    disasterSettings: CountryDisasterSettingsEntity,
    eventTriggerValue: number,
  ): Promise<DisasterSpecificProperties> {
    const eapAlertClasses = JSON.parse(
      JSON.stringify(disasterSettings.eapAlertClasses),
    );
    const alertClassKey = Object.keys(eapAlertClasses).find(
      (key) => eapAlertClasses[key].value === eventTriggerValue,
    );

    return {
      eapAlertClass: {
        key: alertClassKey,
        ...eapAlertClasses[alertClassKey],
      },
    };
  }
}
