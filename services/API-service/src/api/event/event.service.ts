import { Injectable } from '@nestjs/common';
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
  UpdateResult,
} from 'typeorm';

import {
  AlertArea,
  EapAlertClass,
  EapAlertClassKeyEnum,
  EventSummaryCountry,
} from '../../shared/data.model';
import { HelperService } from '../../shared/helper.service';
import {
  ALERT_THRESHOLD,
  FORECAST_SEVERITY,
  FORECAST_TRIGGER,
} from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryDisasterSettingsEntity } from '../country/country-disaster.entity';
import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { EapActionsService } from './../eap-actions/eap-actions.service';
import { AlertPerLeadTimeEntity } from './alert-per-lead-time.entity';
import { AreaForecastDataDto } from './dto/area-forecast-data.dto';
import {
  ActivationLogDto,
  EventPlaceCodesDto,
} from './dto/event-place-code.dto';
import { LastUploadDateDto } from './dto/last-upload-date.dto';
import {
  UploadAlertsPerLeadTimeDto,
  UploadTriggerPerLeadTimeDto,
} from './dto/upload-alerts-per-lead-time.dto';
import { ALERT_LEVEL_WARNINGS, AlertLevel } from './enum/alert-level.enum';
import { EventPlaceCodeEntity } from './event-place-code.entity';

@Injectable()
export class EventService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepo: Repository<EventPlaceCodeEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;
  @InjectRepository(AlertPerLeadTimeEntity)
  private readonly alertPerLeadTimeRepository: Repository<AlertPerLeadTimeEntity>;
  @InjectRepository(DisasterTypeEntity)
  private readonly disasterTypeRepository: Repository<DisasterTypeEntity>;
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
    const lastUploadDate = await this.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const eventSummaryQueryBuilder = this.createEventSummaryQueryBuilder(
      countryCodeISO3,
    ).andWhere({
      closed: false,
      endDate: MoreThanOrEqual(lastUploadDate.date),
      disasterType,
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
    const sixDaysAgo = subDays(new Date(), 6); // NOTE: this 7-day rule is no longer applicable. Fix this when re-enabling this feature.
    const eventSummaryQueryBuilder = this.createEventSummaryQueryBuilder(
      countryCodeISO3,
    )
      .andWhere('event.endDate > :endDate', { endDate: sixDaysAgo })
      .andWhere({ adminArea: { countryCodeISO3 } })
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
      event.alertLevel = this.getAlertLevel(event);
      if (disasterType === DisasterType.Typhoon) {
        event.disasterSpecificProperties =
          await this.typhoonTrackService.getTyphoonSpecificProperties(
            countryCodeISO3,
            event.eventName,
          );
      } else {
        event.disasterSpecificProperties = {};
      }
      event.disasterSpecificProperties.eapAlertClass =
        await this.getEventEapAlertClass(disasterSettings, event.alertLevel);
    }
    return rawEvents;
  }

  public getAlertLevel(event: EventSummaryCountry): AlertLevel {
    if (event.userTrigger || event.forecastTrigger) {
      return AlertLevel.TRIGGER;
    }

    if (event.forecastSeverity > 0.7) {
      return AlertLevel.WARNING;
    } else if (event.forecastSeverity > 0.3) {
      return AlertLevel.WARNINGMEDIUM;
    } else if (event.forecastSeverity > 0) {
      return AlertLevel.WARNINGLOW;
    }

    return AlertLevel.NONE;
  }

  private createEventSummaryQueryBuilder(
    countryCodeISO3: string,
  ): SelectQueryBuilder<EventPlaceCodeEntity> {
    return this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select(['area."countryCodeISO3"', 'event."eventName"'])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.user', 'user')
      .groupBy('area."countryCodeISO3"')
      .addGroupBy('event."eventName"')
      .addSelect([
        'MIN("firstIssuedDate") AS "firstIssuedDate"',
        'MAX("endDate") AS "endDate"',
        'SUM(CASE WHEN event."forecastSeverity" > 0 THEN 1 ELSE 0 END) AS "nrAlertAreas"', // This count is needed here, because the portal also needs the count of other events when in event view, which it cannot get any more from the triggeredAreas array length, which is then filtered on selected event only
        'MAX(event."forecastSeverity")::float AS "forecastSeverity"',
        'MAX(event."forecastTrigger"::int)::boolean AS "forecastTrigger"',
        'MAX(event."userTrigger"::int)::boolean AS "userTrigger"',
        'MAX(event."userTriggerDate") AS "userTriggerDate"',
        'MAX("user"."firstName" || \' \' || "user"."lastName") AS "userTriggerName"',
        'sum(event."mainExposureValue")::int AS "mainExposureValueSum"', // FIX: this goes wrong in case of percentage indicator (% houses affected typhoon)
      ])
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3,
      });
  }

  // NOTE: this method is here purely as a passthrough, as otherwise eventController would call the helperService directly
  public async getLastUploadDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<LastUploadDateDto> {
    return this.helperService.getLastUploadDate(countryCodeISO3, disasterType);
  }

  // NOTE: remove after all pipelines migrated to new endpoint
  public async convertOldDtoAndUploadAlertPerLeadTime(
    uploadTriggerPerLeadTimeDto: UploadTriggerPerLeadTimeDto,
  ) {
    const uploadAlertsPerLeadTimeDto = new UploadAlertsPerLeadTimeDto();
    uploadAlertsPerLeadTimeDto.countryCodeISO3 =
      uploadTriggerPerLeadTimeDto.countryCodeISO3;
    uploadAlertsPerLeadTimeDto.disasterType =
      uploadTriggerPerLeadTimeDto.disasterType;
    uploadAlertsPerLeadTimeDto.eventName =
      uploadTriggerPerLeadTimeDto.eventName;
    uploadAlertsPerLeadTimeDto.date = uploadAlertsPerLeadTimeDto.date;
    uploadAlertsPerLeadTimeDto.alertsPerLeadTime =
      uploadTriggerPerLeadTimeDto.triggersPerLeadTime.map((trigger) => {
        return {
          leadTime: trigger.leadTime,
          forecastAlert: trigger.triggered,
          forecastTrigger: trigger.thresholdReached,
        };
      });
    await this.uploadAlertsPerLeadTime(uploadAlertsPerLeadTimeDto);
  }

  public async uploadAlertsPerLeadTime(
    uploadAlertsPerLeadTimeDto: UploadAlertsPerLeadTimeDto,
  ): Promise<AlertPerLeadTimeEntity[]> {
    uploadAlertsPerLeadTimeDto.date = this.helperService.setDayToLastDayOfMonth(
      uploadAlertsPerLeadTimeDto.date,
      uploadAlertsPerLeadTimeDto.alertsPerLeadTime[0].leadTime,
    );
    const alertsPerLeadTime: AlertPerLeadTimeEntity[] = [];
    const timestamp = uploadAlertsPerLeadTimeDto.date || new Date();
    for (const alertPerLeadTime of uploadAlertsPerLeadTimeDto.alertsPerLeadTime) {
      // Delete existing entries in case of a re-run of the pipeline within the same time period
      await this.deleteDuplicates(uploadAlertsPerLeadTimeDto);

      const alertPerLeadTimeEntity = new AlertPerLeadTimeEntity();
      alertPerLeadTimeEntity.date =
        uploadAlertsPerLeadTimeDto.date || new Date();
      alertPerLeadTimeEntity.timestamp = timestamp;
      alertPerLeadTimeEntity.countryCodeISO3 =
        uploadAlertsPerLeadTimeDto.countryCodeISO3;
      alertPerLeadTimeEntity.leadTime = alertPerLeadTime.leadTime as LeadTime;
      alertPerLeadTimeEntity.forecastAlert = alertPerLeadTime.forecastAlert;
      alertPerLeadTimeEntity.forecastTrigger = alertPerLeadTime.forecastTrigger;
      alertPerLeadTimeEntity.disasterType =
        uploadAlertsPerLeadTimeDto.disasterType;
      alertPerLeadTimeEntity.eventName = uploadAlertsPerLeadTimeDto.eventName;

      alertsPerLeadTime.push(alertPerLeadTimeEntity);
    }

    return this.alertPerLeadTimeRepository.save(alertsPerLeadTime);
  }

  private async deleteDuplicates(
    uploadAlertsPerLeadTimeDto: UploadAlertsPerLeadTimeDto,
  ): Promise<void> {
    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      uploadAlertsPerLeadTimeDto.disasterType,
      uploadAlertsPerLeadTimeDto.date,
    );

    const deleteFilters = {
      countryCodeISO3: uploadAlertsPerLeadTimeDto.countryCodeISO3,
      disasterType: uploadAlertsPerLeadTimeDto.disasterType,
      timestamp: MoreThanOrEqual(uploadCutoffMoment),
    };
    if (uploadAlertsPerLeadTimeDto.eventName) {
      deleteFilters['eventName'] = uploadAlertsPerLeadTimeDto.eventName;
    }
    await this.alertPerLeadTimeRepository.delete(deleteFilters);
  }

  private async deleteDuplicateEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    lastUploadDate: LastUploadDateDto,
  ): Promise<void> {
    const deleteFilters = {
      adminArea: { countryCodeISO3 },
      disasterType,
      firstIssuedDate: MoreThanOrEqual(lastUploadDate.cutoffMoment),
    };
    if (eventName) {
      deleteFilters['eventName'] = eventName;
    }

    const eventAreasToDelete = await this.eventPlaceCodeRepo.find({
      where: deleteFilters,
    });
    await this.eventPlaceCodeRepo.remove(eventAreasToDelete);
  }

  public async getCountryDisasterSettings(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    return (
      await this.countryRepository.findOne({
        where: { countryCodeISO3 },
        relations: ['countryDisasterSettings'],
      })
    ).countryDisasterSettings.find(
      (countryDisasterSettings: CountryDisasterSettingsEntity) =>
        countryDisasterSettings.disasterType === disasterType,
    );
  }

  public async getAlertAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
  ): Promise<AlertArea[]> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const activeAlertAreas = await this.getActiveAlertAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      lastUploadDate,
      eventName,
    );
    const { defaultAdminLevel } = await this.getCountryDisasterSettings(
      countryCodeISO3,
      disasterType,
    );

    if (adminLevel > defaultAdminLevel) {
      // Use this to also return something on deeper levels than default (to show in chat-section)
      return this.getDeeperAlertAreas(
        activeAlertAreas,
        disasterType,
        lastUploadDate,
        eventName,
      );
    }

    const whereFiltersEvent = {
      closed: false,
      disasterType: disasterType,
      adminArea: { countryCodeISO3 },
      forecastSeverity: MoreThan(0),
    };
    if (eventName) {
      whereFiltersEvent['eventName'] = eventName;
    }

    const eventPlaceCodes = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'area."adminLevel" AS "adminLevel"',
        'event."mainExposureValue"',
        'event."forecastSeverity"',
        'event."forecastTrigger"',
        'event."eventPlaceCodeId"',
        'event."userTrigger"',
        'event."firstIssuedDate"',
        'event."userTriggerDate" AS "userTriggerDate"',
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
      .orderBy('event."mainExposureValue"', 'DESC')
      .getRawMany();

    for (const eventPlaceCode of eventPlaceCodes) {
      eventPlaceCode.alertLevel = this.getAlertLevel(eventPlaceCode);
      if (activeAlertAreas.length === 0) {
        eventPlaceCode.eapActions = [];
      } else if (ALERT_LEVEL_WARNINGS.includes(eventPlaceCode.alertLevel)) {
        // Do not show actions for warning events/areas
        eventPlaceCode.eapActions = [];
      } else {
        eventPlaceCode.eapActions =
          await this.eapActionsService.getActionsWithStatus(
            countryCodeISO3,
            disasterType,
            eventPlaceCode.placeCode,
            eventName,
          );
      }
    }

    return eventPlaceCodes;
  }

  private async getDeeperAlertAreas(
    alertAreas: AreaForecastDataDto[],
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
    eventName?: string,
    leadTime?: string,
  ): Promise<AlertArea[]> {
    const mainExposureIndicator =
      await this.getMainExposureIndicator(disasterType);

    const placeCodes = alertAreas.map(({ placeCode }) => placeCode);

    const whereFilters = {
      placeCode: In(placeCodes),
      indicator: mainExposureIndicator,
      disasterType,
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
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
      // add parent event area
      .leftJoin(
        AdminAreaEntity,
        'parent',
        'area."placeCodeParent" = parent."placeCode"',
      )
      .leftJoin('parent.eventPlaceCodes', 'parentEvent')
      .leftJoin('parentEvent.user', 'parentUser')
      // add grandparent event area
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
        'COALESCE("parentEvent"."firstIssuedDate","grandparentEvent"."firstIssuedDate") AS "firstIssuedDate"',
        'COALESCE("parentEvent"."userTrigger","grandparentEvent"."userTrigger") AS "userTrigger"',
        'COALESCE("parentEvent"."userTriggerDate","grandparentEvent"."userTriggerDate") AS "userTriggerDate"',
        'COALESCE("parentUser"."firstName","grandparentUser"."firstName") || \' \' || COALESCE("parentUser"."lastName","grandparentUser"."lastName") AS "displayName"',
      ])
      .getRawMany();

    return areas.map((area) => ({
      placeCode: area.placeCode,
      name: area.name,
      nameParent: null,
      mainExposureValue: area.value,
      forecastSeverity: null, // leave empty for now, as we don't show forecastSeverity on deeper levels
      userTrigger: area.userTrigger,
      firstIssuedDate: area.firstIssuedDate,
      userTriggerDate: area.userTriggerDate,
      displayName: area.displayName,
      eapActions: [],
      alertLevel: this.getAlertLevel(area),
    }));
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
        'event."firstIssuedDate"',
        'event.closed as closed',
        'case when event.closed = true then event."endDate" end as "endDate"',
        'disaster."mainExposureIndicator" as "exposureIndicator"',
        'event."mainExposureValue" as "exposureValue"',
        `CASE
        WHEN event."userTrigger" = true THEN 'trigger'
        WHEN event."forecastTrigger" = true THEN 'trigger'
        WHEN event."forecastSeverity" > 0.7 THEN 'warning'
        WHEN event."forecastSeverity" > 0.3 THEN 'warning-medium'
        WHEN event."forecastSeverity" > 0 THEN 'warning-low'
        END as "alertLevel"`,
        'event."userTrigger" as "userTrigger"',
        'event."userTrigger" as "userTrigger"',
        'event."userTriggerDate" as "userTriggerDate"',
        'event."eventPlaceCodeId" as "databaseId"',
      ])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.disasterType', 'disaster')
      .where({ forecastSeverity: MoreThan(0) })
      .orderBy('event."firstIssuedDate"', 'DESC')
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
    const timesteps = await this.getAlertPerLeadTime(
      countryCodeISO3,
      disasterType,
      eventName,
    );
    let firstKey = null;
    Object.keys(timesteps)
      .filter((key) => Object.values(LeadTime).includes(key as LeadTime))
      .sort((a, b) =>
        Number(a.split('-')[0]) > Number(b.split('-')[0]) ? 1 : -1,
      )
      .forEach((key) => {
        if (triggeredLeadTime) {
          if (timesteps[`${key}-forecastTrigger`] === '1') {
            firstKey = !firstKey ? key : firstKey;
          }
        } else {
          if (timesteps[key] === '1') {
            firstKey = !firstKey ? key : firstKey;
          }
        }
      });
    return firstKey;
  }

  public async getAlertPerLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
  ): Promise<object> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );

    const whereFilters = {
      countryCodeISO3,
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
      disasterType,
    };
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }

    // get max per leadTime (for multi-event case national view)
    const alertsPerLeadTime = await this.alertPerLeadTimeRepository
      .createQueryBuilder('alertPerLeadTime')
      .select([
        'alertPerLeadTime.leadTime as "leadTime"',
        'alertPerLeadTime.date as date',
        'MAX(CASE WHEN alertPerLeadTime.forecastAlert = TRUE THEN 1 ELSE 0 END) as "forecastAlert"',
        'MAX(CASE WHEN alertPerLeadTime.forecastTrigger = TRUE THEN 1 ELSE 0 END) as "forecastTrigger"',
      ])
      .where(whereFilters)
      .groupBy('alertPerLeadTime.leadTime')
      .addGroupBy('alertPerLeadTime.date')
      .getRawMany();

    if (alertsPerLeadTime.length === 0) {
      return {};
    }
    const result = {
      date: alertsPerLeadTime[0].date,
    };
    for (const leadTimeKey in LeadTime) {
      const leadTimeUnit = LeadTime[leadTimeKey];
      const leadTimeIsAlerted = alertsPerLeadTime.find(
        (alertPerLeadTime: AlertPerLeadTimeEntity): boolean =>
          alertPerLeadTime.leadTime === leadTimeUnit,
      );
      // REFACTOR: don't reformat the data structure so much, but keep (and use in front-end) closer to how the data is stored
      if (leadTimeIsAlerted) {
        result[leadTimeUnit] = String(Number(leadTimeIsAlerted.forecastAlert));
        result[`${leadTimeUnit}-forecastTrigger`] = String(
          Number(leadTimeIsAlerted.forecastTrigger),
        );
      }
    }
    return result;
  }

  public async setTrigger(
    userId: string,
    eventPlaceCodesDto: EventPlaceCodesDto,
  ): Promise<UpdateResult> {
    return await this.eventPlaceCodeRepo.update(
      eventPlaceCodesDto.eventPlaceCodeIds,
      {
        userTrigger: true,
        userTriggerDate: new Date(),
        user: { userId },
      },
    );
  }

  private async getMainExposureIndicator(
    disasterType: DisasterType,
  ): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['mainExposureIndicator'],
        where: { disasterType },
      })
    ).mainExposureIndicator;
  }

  public async getActiveEventNames(
    countryCodeISO3: string,
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
  ) {
    const whereFilters = {
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
      countryCodeISO3,
      disasterType,
    };

    return this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select('dynamic."eventName"')
      .where(whereFilters)
      .groupBy('dynamic."eventName"')
      .getRawMany();
  }

  public async processEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
    lastUploadDate: LastUploadDateDto,
  ): Promise<void> {
    // First delete duplicate events for upload within same time-block
    // REFACTOR: evaluate if this is still needed. The overwriting should be necessary only on raw input (admin-area-dynamic-data) not on this derived data?
    await this.deleteDuplicateEvents(
      countryCodeISO3,
      disasterType,
      eventName,
      lastUploadDate,
    );

    const activeAlertAreas = await this.getActiveAlertAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      lastUploadDate,
      eventName,
    );

    await this.insertAlertsPerLeadTime(
      countryCodeISO3,
      disasterType,
      eventName,
      activeAlertAreas,
      lastUploadDate,
    );

    // update existing event areas + update population and end_date
    await this.updateExistingEventAreas(
      countryCodeISO3,
      disasterType,
      eventName,
      activeAlertAreas,
      lastUploadDate,
    );

    // add new event areas
    await this.addNewEventAreas(
      countryCodeISO3,
      disasterType,
      eventName,
      activeAlertAreas,
      lastUploadDate,
    );
  }

  // REFACTOR: Figure out the difference with getAlertAreas and see if they can be combined.
  public async getActiveAlertAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    lastUploadDate: LastUploadDateDto,
    eventName?: string,
  ): Promise<AreaForecastDataDto[]> {
    const whereFilters = {
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
      countryCodeISO3,
      adminLevel,
      disasterType,
    };

    if (eventName) {
      whereFilters['eventName'] = eventName;
    }

    const mainExposureIndicator =
      await this.getMainExposureIndicator(disasterType);

    const areasWithForecastSeverityData = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('severity')
      .select([
        'severity.placeCode AS "placeCode"',
        'severity.leadTime AS "leadTime"',
        'severity.value AS "forecastSeverity"',
        'trigger.value AS "forecastTrigger"',
        'exposure.value AS "mainExposureValue"',
      ])
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'trigger',
        `severity.placeCode = trigger."placeCode"
        AND severity.timestamp = trigger."timestamp"
        AND severity.eventName = trigger."eventName"
        AND severity.disasterType = trigger."disasterType"
        AND severity.leadTime = trigger."leadTime"
        AND trigger.indicator = :forecastTrigger`,
        { forecastTrigger: FORECAST_TRIGGER },
      )
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'exposure',
        `severity.placeCode = exposure."placeCode"
        AND severity.timestamp = exposure."timestamp"
        AND severity.eventName = exposure."eventName"
        AND severity.disasterType = exposure."disasterType"
        AND severity.leadTime = exposure."leadTime"
        AND exposure.indicator = :mainExposureIndicator`,
        { mainExposureIndicator },
      )
      .where({
        ...whereFilters,
        indicator: FORECAST_SEVERITY,
        value: MoreThan(0),
      })
      .getRawMany();

    // This "if" assumes that if forecast_severity is present for 1 area it is present for all
    if (areasWithForecastSeverityData.length) {
      return areasWithForecastSeverityData.map((area) => ({
        placeCode: area.placeCode,
        leadTime: area.leadTime as LeadTime,
        forecastSeverity: area.forecastSeverity,
        forecastTrigger: area.forecastTrigger === 1 ? true : false, // This reflects that forecastTrigger is optional (and assumed false if not present) and that this boolean layer is uploaded in practice as 1/0.
        mainExposureValue: area.mainExposureValue,
      }));
    } else {
      // NOTE: remove after all pipelines migrated to new setup
      const areasWithAlertThresholdData = await this.adminAreaDynamicDataRepo
        .createQueryBuilder('alert')
        .select([
          'alert.placeCode AS "placeCode"',
          'alert.leadTime AS "leadTime"',
          'alert.value AS "alertThresholdValue"',
          'exposure.value AS "mainExposureValue"',
        ])
        .leftJoin(
          AdminAreaDynamicDataEntity,
          'exposure',
          `alert.placeCode = exposure."placeCode"
        AND alert.timestamp = exposure."timestamp"
        AND alert.eventName = exposure."eventName"
        AND alert.disasterType = exposure."disasterType"
        AND alert.leadTime = exposure."leadTime"
        AND exposure.indicator = :indicator`,
          { indicator: mainExposureIndicator },
        )
        .where({
          ...whereFilters,
          indicator: ALERT_THRESHOLD,
        })
        .andWhere(
          `(alert.value > 0 OR (alert."disasterType" IN ('typhoon','flash-floods')))`, // This reflects the current functionality where alert_threshold=0 for warnings in typhoon and flash-floods
        )
        .getRawMany();

      // TODO: handle situations where also this results in empty array?

      return areasWithAlertThresholdData.map((area) => ({
        placeCode: area.placeCode,
        leadTime: area.leadTime as LeadTime,
        forecastSeverity:
          area.alertThresholdValue > 0 ? area.alertThresholdValue : 1, // This maps 0-values for typhoon/flash-floods to severity of 1 in the new setup.
        forecastTrigger: area.alertThresholdValue === 1, // This reflects current functionality where trigger is equal to alert_threshold=1
        mainExposureValue: area.mainExposureValue,
      }));
    }
  }

  public async insertAlertsPerLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    activeAlertAreas: AreaForecastDataDto[],
    lastUploadDate: LastUploadDateDto,
  ) {
    const uploadAlertPerLeadTimeDto = new UploadAlertsPerLeadTimeDto();
    uploadAlertPerLeadTimeDto.countryCodeISO3 = countryCodeISO3;
    uploadAlertPerLeadTimeDto.disasterType = disasterType;
    uploadAlertPerLeadTimeDto.eventName = eventName;
    uploadAlertPerLeadTimeDto.date = lastUploadDate.timestamp;
    if (activeAlertAreas.length) {
      uploadAlertPerLeadTimeDto.alertsPerLeadTime = [
        {
          leadTime: activeAlertAreas[0].leadTime,
          forecastAlert: activeAlertAreas[0].forecastSeverity > 0,
          forecastTrigger: activeAlertAreas[0].forecastTrigger,
        },
      ];
    } else {
      const noEventLeadTimes = await this.getLeadTimesNoEvents(
        disasterType,
        countryCodeISO3,
        lastUploadDate.timestamp,
      );
      uploadAlertPerLeadTimeDto.alertsPerLeadTime = noEventLeadTimes.map(
        (leadTime) => ({
          leadTime,
          forecastAlert: false,
          forecastTrigger: false,
        }),
      );
    }

    return this.uploadAlertsPerLeadTime(uploadAlertPerLeadTimeDto);
  }

  public async getLeadTimesNoEvents(
    disasterType: DisasterType,
    countryCodeISO3: string,
    date: Date,
  ): Promise<LeadTime[]> {
    // REFACTOR: this reflects agreements with pipelines that are in place. This is ugly, and should be refactored better.
    if (disasterType === DisasterType.Floods) {
      return [LeadTime.day1];
    } else if (disasterType === DisasterType.FlashFloods) {
      return [LeadTime.hour1];
    } else if (disasterType === DisasterType.Drought) {
      const leadTime = await this.getLeadTimeDroughtNoEvents(
        countryCodeISO3,
        date,
      );
      return [leadTime];
    } else if (disasterType === DisasterType.Typhoon) {
      return [LeadTime.hour72];
    } else {
      const country = await this.countryRepository.findOne({
        where: { countryCodeISO3 },
        relations: ['countryDisasterSettings'],
      });
      return country.countryDisasterSettings.find(
        (countryDisasterSettings: CountryDisasterSettingsEntity) =>
          countryDisasterSettings.disasterType === disasterType,
      ).activeLeadTimes;
    }
  }

  public async getLeadTimeDroughtNoEvents(
    countryCodeISO3: string,
    date: Date,
  ): Promise<LeadTime> {
    const country = await this.countryRepository.findOne({
      where: { countryCodeISO3 },
      relations: ['countryDisasterSettings'],
    });
    const droughtSeasonRegions = country.countryDisasterSettings.find(
      (countryDisasterSettings: CountryDisasterSettingsEntity) =>
        countryDisasterSettings.disasterType === DisasterType.Drought,
    ).droughtSeasonRegions;

    // for no events, look at all seasons in all regions
    let minDiff = 12;
    const currentMonth = new Date(date).getUTCMonth() + 1;
    for (const regionName of Object.keys(droughtSeasonRegions)) {
      for (const seasonName of Object.keys(droughtSeasonRegions[regionName])) {
        const season = droughtSeasonRegions[regionName][seasonName].rainMonths;
        if (season.includes(currentMonth)) {
          // .. if ongoing in any season, then return '0-month'
          return LeadTime.month0;
        }
        // .. otherwise calculate smallest leadTime until first upcoming season
        let diff: number;
        if (currentMonth <= season[0]) {
          diff = season[0] - currentMonth;
        } else if (currentMonth > season[0]) {
          diff = 12 - currentMonth + season[0];
        }
        if (diff < minDiff) {
          minDiff = diff;
        }
      }
    }

    return `${minDiff}-month` as LeadTime;
  }

  private async updateExistingEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    activeAlertAreas: AreaForecastDataDto[],
    lastUploadDate: LastUploadDateDto,
  ): Promise<void> {
    const activeEventAreas = await this.eventPlaceCodeRepo.find({
      where: {
        closed: false,
        adminArea: { countryCodeISO3 },
        disasterType,
        eventName: eventName || IsNull(),
      },
      relations: ['adminArea'],
    });

    const triggerAreaIdsToUpdate: string[] = [];
    const warningAreaIdsToUpdate: string[] = [];
    const areasToUpdate: EventPlaceCodeEntity[] = [];
    activeEventAreas.forEach((activeEventArea: EventPlaceCodeEntity) => {
      const activeAlertArea = activeAlertAreas.find(
        (area) => area.placeCode === activeEventArea.adminArea.placeCode,
      );
      if (activeAlertArea) {
        if (activeAlertArea.forecastTrigger) {
          activeEventArea.forecastTrigger = true;
          triggerAreaIdsToUpdate.push(activeEventArea.eventPlaceCodeId);
        } else {
          activeEventArea.forecastTrigger = false;
          warningAreaIdsToUpdate.push(activeEventArea.eventPlaceCodeId);
        }

        // NOTE: for performance reasons only update if values actually changed. Otherwise unneeded queries per area are fired.
        if (
          activeEventArea.forecastSeverity !==
            activeAlertArea.forecastSeverity ||
          activeEventArea.mainExposureValue !==
            activeAlertArea.mainExposureValue
        ) {
          activeEventArea.forecastSeverity = activeAlertArea.forecastSeverity;
          activeEventArea.mainExposureValue = activeAlertArea.mainExposureValue;
          areasToUpdate.push(activeEventArea);
        }
      }
    });

    const endDate = lastUploadDate.timestamp;
    // NOTE this split in 3 updates is to optimize performance. Combine all bulk (same value) updates as much as possible in one query, to avoid separate query per area.
    // 1. first fire one query to update all rows that need forecastTrigger = true (and pass endDate)
    await this.updateBulkEventData(triggerAreaIdsToUpdate, true, endDate);

    // 2. then fire one query to update all rows that need forecastTrigger = false
    await this.updateBulkEventData(warningAreaIdsToUpdate, false, endDate);

    // .. lastly we update those records where mainExposureValue or forecastSeverity changed
    await this.updateOtherEventData(areasToUpdate);
  }

  private async updateBulkEventData(
    eventPlaceCodeIds: string[],
    forecastTrigger: boolean,
    endDate: Date,
  ) {
    if (!eventPlaceCodeIds.length) {
      return;
    }

    await this.eventPlaceCodeRepo
      .createQueryBuilder()
      .update()
      .set({ forecastTrigger, endDate })
      .where({ eventPlaceCodeId: In(eventPlaceCodeIds) })
      .execute();
  }

  private async updateOtherEventData(activeEventAreas: EventPlaceCodeEntity[]) {
    if (!activeEventAreas.length) {
      return;
    }

    const eventAreasInput = activeEventAreas.map(
      (eventArea) =>
        `('${eventArea.eventPlaceCodeId}',${eventArea.mainExposureValue},${eventArea.forecastSeverity})`,
    );
    const repository = this.dataSource.getRepository(EventPlaceCodeEntity);
    const updateQuery = `UPDATE \
      "${repository.metadata.schema}"."${repository.metadata.tableName}" epc \
      SET \
          "mainExposureValue" = areas.mainExposureValue::double precision, \
          "forecastSeverity" = areas.forecastSeverity::double precision \
      FROM \
         (VALUES ${eventAreasInput.join(',')}) \
         areas(id, mainExposureValue, forecastSeverity) \
      WHERE \
          areas.id::uuid = epc."eventPlaceCodeId" \
      `;
    await this.dataSource.query(updateQuery);
  }

  private async addNewEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    activeAlertAreas: AreaForecastDataDto[],
    lastUploadDate: LastUploadDateDto,
  ): Promise<void> {
    const activeEventAreaPlaceCodes = (
      await this.eventPlaceCodeRepo.find({
        where: {
          closed: false,
          adminArea: { countryCodeISO3 },
          disasterType,
          eventName: eventName || IsNull(),
        },
        relations: ['adminArea'],
      })
    ).map(
      (eventPlaceCode: EventPlaceCodeEntity) =>
        eventPlaceCode.adminArea.placeCode,
    );
    const newEventAreas: EventPlaceCodeEntity[] = [];
    for await (const activeAlertArea of activeAlertAreas) {
      if (!activeEventAreaPlaceCodes.includes(activeAlertArea.placeCode)) {
        const adminArea = await this.adminAreaRepository.findOne({
          where: { placeCode: activeAlertArea.placeCode },
        });
        const eventArea = new EventPlaceCodeEntity();
        eventArea.adminArea = adminArea;
        eventArea.eventName = eventName;
        eventArea.forecastTrigger = activeAlertArea.forecastTrigger;
        eventArea.forecastSeverity = activeAlertArea.forecastSeverity;
        eventArea.mainExposureValue = +activeAlertArea.mainExposureValue;
        eventArea.firstIssuedDate = lastUploadDate.timestamp;
        eventArea.endDate = lastUploadDate.timestamp;
        eventArea.disasterType = disasterType;
        newEventAreas.push(eventArea);
      }
    }
    await this.eventPlaceCodeRepo.save(newEventAreas);
  }

  public async closeEventsAutomatic(
    countryCodeISO3: string,
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
  ) {
    const where = {
      endDate: LessThan(lastUploadDate.timestamp), // If the area was not prolonged earlier, then the endDate is not updated and is therefore less than the lastUploadDate
      adminArea: { countryCodeISO3 },
      disasterType,
      closed: false,
    };
    const expiredEventAreas = await this.eventPlaceCodeRepo.find({ where });

    // Warning events are removed from this table after closing to clean up
    const belowThresholdEvents = expiredEventAreas.filter(
      ({ forecastTrigger }) => !forecastTrigger,
    );
    await this.eventPlaceCodeRepo.remove(belowThresholdEvents);

    //For the other ones update 'closed = true'
    const aboveThresholdEvents = expiredEventAreas.filter(
      ({ forecastTrigger }) => forecastTrigger,
    );
    for (const area of aboveThresholdEvents) {
      area.closed = true;
    }
    await this.eventPlaceCodeRepo.save(aboveThresholdEvents);
  }

  // REFACTOR: this can be set up much better
  private async getEventEapAlertClass(
    disasterSettings: CountryDisasterSettingsEntity,
    alertLevel: AlertLevel,
  ): Promise<EapAlertClass> {
    if (disasterSettings.disasterType === DisasterType.Floods) {
      const alertLevelToEAPAlertClass = {
        [AlertLevel.TRIGGER]: EapAlertClassKeyEnum.max,
        [AlertLevel.WARNING]: EapAlertClassKeyEnum.med,
        [AlertLevel.WARNINGMEDIUM]: EapAlertClassKeyEnum.med,
        [AlertLevel.WARNINGLOW]: EapAlertClassKeyEnum.min,
        [AlertLevel.NONE]: EapAlertClassKeyEnum.no,
      };
      const eapAlertClasses = JSON.parse(
        JSON.stringify(disasterSettings.eapAlertClasses),
      );
      const alertClassKey = Object.keys(eapAlertClasses).find(
        (key) => key === alertLevelToEAPAlertClass[alertLevel],
      );
      return {
        key: alertClassKey,
        ...eapAlertClasses[alertClassKey],
      };
    } else {
      if (alertLevel === AlertLevel.TRIGGER) {
        return {
          key: EapAlertClassKeyEnum.max,
          label: 'Trigger',
          color: 'ibf-glofas-trigger',
          value: 1,
        };
      } else if (ALERT_LEVEL_WARNINGS.includes(alertLevel)) {
        return {
          key: EapAlertClassKeyEnum.med,
          label: 'Warning',
          color: 'ibf-orange',
          value: 1,
        };
      } else {
        return {
          key: EapAlertClassKeyEnum.no,
          label: 'No alert',
          color: 'ibf-no-alert-primary',
          value: 0,
        };
      }
    }
  }
}
