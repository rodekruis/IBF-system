import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';
import { format, formatISO, subDays } from 'date-fns';
import {
  DataSource,
  Equal,
  In,
  IsNull,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { API_SERVICE_URL, DASHBOARD_URL } from '../../config';
import { AlertArea, Event } from '../../shared/data.model';
import { HelperService } from '../../shared/helper.service';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import {
  ALERT_THRESHOLD,
  FORECAST_SEVERITY,
  FORECAST_TRIGGER,
} from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { CountryService } from '../country/country.service';
import {
  CountryDisasterSettingsEntity,
  CountryDisasterType,
} from '../country/country-disaster.entity';
import {
  DISASTER_TYPE_CODE,
  DISASTER_TYPE_LABEL,
  DisasterType,
} from '../disaster-type/disaster-type.enum';
import { DisasterTypeService } from '../disaster-type/disaster-type.service';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { EapActionsService } from './../eap-actions/eap-actions.service';
import { AlertPerLeadTimeEntity } from './alert-per-lead-time.entity';
import { AreaForecastDataDto } from './dto/area-forecast-data.dto';
import { ActivationLogDto } from './dto/event-place-code.dto';
import { LastUploadDateDto } from './dto/last-upload-date.dto';
import {
  UploadAlertsPerLeadTimeDto,
  UploadTriggerPerLeadTimeDto,
} from './dto/upload-alerts-per-lead-time.dto';
import {
  ALERT_LEVEL_RANK,
  ALERT_LEVEL_WARNINGS,
  AlertLevel,
} from './enum/alert-level.enum';
import { EventPlaceCodeEntity } from './event-place-code.entity';

@Injectable()
export class EventService {
  @InjectRepository(EventPlaceCodeEntity)
  private eventPlaceCodeRepository: Repository<EventPlaceCodeEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private adminAreaDynamicDataRepository: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(AdminAreaEntity)
  private adminAreaRepository: Repository<AdminAreaEntity>;
  @InjectRepository(AlertPerLeadTimeEntity)
  private alertPerLeadTimeRepository: Repository<AlertPerLeadTimeEntity>;

  public constructor(
    private eapActionsService: EapActionsService,
    private disasterTypeService: DisasterTypeService,
    private helperService: HelperService,
    private dataSource: DataSource,
    private typhoonTrackService: TyphoonTrackService,
    private countryService: CountryService,
  ) {}

  public async getEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<Event[]> {
    const lastUploadDate = await this.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const getEventsQueryBuilder = this.createGetEventsQueryBuilder({
      countryCodeISO3,
      disasterType,
    }).andWhere({
      closed: false,
      endDate: MoreThanOrEqual(lastUploadDate.date),
    });
    return this.queryAndMapEvents(
      getEventsQueryBuilder,
      countryCodeISO3,
      disasterType,
    );
  }

  public async getEventsTriggerFinishedMail(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<Event[]> {
    const sixDaysAgo = subDays(new Date(), 6); // NOTE: this 7-day rule is no longer applicable. Fix this when re-enabling this feature.
    const getEventsQueryBuilder = this.createGetEventsQueryBuilder({
      countryCodeISO3,
      disasterType,
    })
      .andWhere('event.endDate > :endDate', { endDate: sixDaysAgo })
      .andWhere({ adminArea: { countryCodeISO3 } })
      .andWhere('event.closed = :closed', { closed: true });

    return this.queryAndMapEvents(
      getEventsQueryBuilder,
      countryCodeISO3,
      disasterType,
    );
  }

  private async queryAndMapEvents(
    qb: SelectQueryBuilder<EventPlaceCodeEntity>,
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<Event[]> {
    const rawEvents = await qb.getRawMany();
    const events = await this.populateEventsDetails(
      rawEvents,
      countryCodeISO3,
      disasterType,
    );
    return this.sortEventsByLeadTimeAndAlertState(events);
  }

  private sortEventsByLeadTimeAndAlertState(events: Event[]): Event[] {
    const leadTimeValue = (leadTime: LeadTime): number =>
      Number(leadTime.split('-')[0]);

    // NOTE: this sort assumes the lead time unit is the same for these events
    return events.sort((a, b) => {
      if (leadTimeValue(a.firstLeadTime) < leadTimeValue(b.firstLeadTime)) {
        return -1;
      }
      if (leadTimeValue(a.firstLeadTime) > leadTimeValue(b.firstLeadTime)) {
        return 1;
      }

      return this.sortByAlertLevel(a, b);
    });
  }

  private async populateEventsDetails(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawEvents: any[],
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<Event[]> {
    const countryDisasterSettings = await this.getCountryDisasterSettings(
      countryCodeISO3,
      disasterType,
    );
    for (const event of rawEvents) {
      event.alertAreas = await this.getAlertAreas(
        countryCodeISO3,
        disasterType,
        countryDisasterSettings?.defaultAdminLevel,
        event.eventName,
      );
      event.firstLeadTime = await this.getFirstLeadTime(
        countryCodeISO3,
        disasterType,
        event.eventName,
        false,
      );
      event.firstTriggerLeadTime = event.userTrigger
        ? event.firstLeadTime
        : await this.getFirstLeadTime(
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
    }
    return rawEvents;
  }

  public getAlertLevel(event: Event): AlertLevel {
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

  private createGetEventsQueryBuilder({
    countryCodeISO3,
    disasterType,
  }: CountryDisasterType): SelectQueryBuilder<EventPlaceCodeEntity> {
    return this.eventPlaceCodeRepository
      .createQueryBuilder('event')
      .select(['area."countryCodeISO3"', 'event."eventName"'])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.user', 'user')
      .groupBy('area."countryCodeISO3"')
      .addGroupBy('event."eventName"')
      .addGroupBy('event."disasterType"')
      .addSelect([
        'MIN("firstIssuedDate") AS "firstIssuedDate"',
        'MAX("endDate") AS "endDate"',
        'MAX(event."forecastSeverity")::float AS "forecastSeverity"',
        'MAX(event."forecastTrigger"::int)::boolean AS "forecastTrigger"',
        'MAX(event."userTrigger"::int)::boolean AS "userTrigger"',
        'MAX(event."userTriggerDate") AS "userTriggerDate"',
        'MAX("user"."firstName" || \' \' || "user"."lastName") AS "userTriggerName"',
        'event."disasterType"',
      ])
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3,
      })
      .andWhere('event.disasterType = :disasterType', { disasterType });
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
      leadTime: In(
        uploadAlertsPerLeadTimeDto.alertsPerLeadTime.map((a) => a.leadTime),
      ),
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

    const eventAreasToDelete = await this.eventPlaceCodeRepository.find({
      where: deleteFilters,
    });
    await this.eventPlaceCodeRepository.remove(eventAreasToDelete);
  }

  public async getCountryDisasterSettings(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ) {
    const country = (
      await this.countryService.getCountries(
        [countryCodeISO3],
        ['countryDisasterSettings'],
      )
    )[0];

    return country?.countryDisasterSettings.find(
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

    let alertAreas = [];

    if (adminLevel > defaultAdminLevel) {
      // Use this to also return something on deeper levels than default (to show in chat-section)
      alertAreas = await this.getDeeperAlertAreas(
        activeAlertAreas,
        disasterType,
        lastUploadDate,
        eventName,
      );
    } else {
      const whereFiltersEvent = {
        closed: false,
        disasterType,
        adminArea: { countryCodeISO3 },
        forecastSeverity: MoreThan(0),
      };
      if (eventName) {
        whereFiltersEvent['eventName'] = eventName;
      }

      alertAreas = await this.eventPlaceCodeRepository
        .createQueryBuilder('event')
        .select([
          'area."placeCode" AS "placeCode"',
          'area.name AS name',
          'area."adminLevel" AS "adminLevel"',
          'event."eventName" AS "eventName"',
          'event."mainExposureValue"',
          'event."forecastSeverity"',
          'event."forecastTrigger"',
          'event."eventPlaceCodeId"',
          'event."userTrigger"',
          'event."firstIssuedDate"',
          'event."userTriggerDate" AS "userTriggerDate"',
          '"user"."firstName" || \' \' || "user"."lastName" AS "userTriggerName"',
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

      for (const alertArea of alertAreas) {
        alertArea.alertLevel = this.getAlertLevel(alertArea);
        if (activeAlertAreas.length === 0) {
          alertArea.eapActions = [];
        } else if (ALERT_LEVEL_WARNINGS.includes(alertArea.alertLevel)) {
          // Do not show actions for warning events/areas
          alertArea.eapActions = [];
        } else {
          alertArea.eapActions =
            await this.eapActionsService.getActionsWithStatus(
              countryCodeISO3,
              disasterType,
              alertArea.placeCode,
              eventName,
            );
        }
      }
    }

    const highestAlertLevels = this.getHighestAlertLevelPerEvent(alertAreas);
    return alertAreas
      .filter(
        ({ alertLevel, eventName }) =>
          alertLevel === highestAlertLevels[eventName || 'unknown'],
      )
      .sort(this.sortByAlertLevel);
  }

  private sortByAlertLevel(
    a: { alertLevel: AlertLevel },
    b: { alertLevel: AlertLevel },
  ): number {
    // sort by alert level
    // trigger, warning, warning-medium, warning-low, none
    const alertLevelSortOrder = Object.values(AlertLevel).reverse();

    return (
      alertLevelSortOrder.indexOf(a.alertLevel) -
      alertLevelSortOrder.indexOf(b.alertLevel)
    );
  }

  private async getDeeperAlertAreas(
    alertAreas: AreaForecastDataDto[],
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
    eventName?: string,
    leadTime?: string,
  ): Promise<AlertArea[]> {
    const mainExposureIndicator =
      await this.disasterTypeService.getMainExposureIndicator(disasterType);

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

    const areas = await this.adminAreaDynamicDataRepository
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
        'COALESCE("parentUser"."firstName","grandparentUser"."firstName") || \' \' || COALESCE("parentUser"."lastName","grandparentUser"."lastName") AS "userTriggerName"',
      ])
      .getRawMany();

    return areas.map((area) => ({
      placeCode: area.placeCode,
      name: area.name,
      nameParent: null,
      mainExposureValue: area.value,
      forecastSeverity: null, // leave empty for now, as we don't show forecastSeverity on deeper levels
      eventName,
      userTrigger: area.userTrigger,
      firstIssuedDate: area.firstIssuedDate,
      userTriggerDate: area.userTriggerDate,
      userTriggerName: area.userTriggerName,
      eapActions: [],
      alertLevel: this.getAlertLevel(area),
    }));
  }

  public getHighestAlertLevelPerEvent(
    areas: { alertLevel: AlertLevel; eventName: string }[],
  ): Record<string, AlertLevel> {
    const eventAlertLevels: Record<string, AlertLevel> = {};

    areas.forEach((area) => {
      const eventName = area.eventName || 'unknown';
      if (!eventAlertLevels[eventName]) {
        eventAlertLevels[eventName] = AlertLevel.NONE;
      }
      const currentHighest = eventAlertLevels[eventName];

      if (
        ALERT_LEVEL_RANK[area.alertLevel] < ALERT_LEVEL_RANK[currentHighest]
      ) {
        eventAlertLevels[eventName] = area.alertLevel;
      }
    });

    return eventAlertLevels;
  }

  public async getActivationLogData(
    countryCodeISO3?: string,
    disasterType?: string,
  ): Promise<ActivationLogDto[]> {
    let baseQuery = this.eventPlaceCodeRepository
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
        .andWhere('event."disasterType" = :disasterType', { disasterType })
        .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
          countryCodeISO3,
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
      timestamp: Equal(lastUploadDate.timestamp),
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
    const result = { date: alertsPerLeadTime[0].date };
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

    return this.adminAreaDynamicDataRepository
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
      await this.disasterTypeService.getMainExposureIndicator(disasterType);

    const areasWithForecastSeverityData =
      await this.adminAreaDynamicDataRepository
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
      const areasWithAlertThresholdData =
        await this.adminAreaDynamicDataRepository
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
          .where({ ...whereFilters, indicator: ALERT_THRESHOLD })
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
      const { activeLeadTimes } = await this.getCountryDisasterSettings(
        countryCodeISO3,
        disasterType,
      );

      return activeLeadTimes;
    }
  }

  public async getLeadTimeDroughtNoEvents(
    countryCodeISO3: string,
    date: Date,
  ): Promise<LeadTime> {
    const { droughtSeasonRegions } = await this.getCountryDisasterSettings(
      countryCodeISO3,
      DisasterType.Drought,
    );

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
    const activeEventAreas = await this.eventPlaceCodeRepository.find({
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

    await this.eventPlaceCodeRepository
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
      await this.eventPlaceCodeRepository.find({
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
    await this.eventPlaceCodeRepository.save(newEventAreas);
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
    const expiredEventAreas = await this.eventPlaceCodeRepository.find({
      where,
    });
    for (const area of expiredEventAreas) {
      area.closed = true;
    }
    await this.eventPlaceCodeRepository.save(expiredEventAreas);
  }

  public async toMontyEvent(event: Event) {
    const country = (
      await this.countryService.getCountries([event.countryCodeISO3])
    )[0];

    const placeCodes = event.alertAreas.map(({ placeCode }) => placeCode);
    const dateFormat = 'dd MMM yyyy HH:mm';
    const id = crypto
      .createHmac('sha256', formatISO(event.firstIssuedDate))
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();
    const correlationId = [
      format(event.firstIssuedDate, "yyyyMMdd'T'HHmmss"),
      country.countryCodeISO3,
      event.disasterType,
      'IBF',
    ]
      .join('-')
      .toUpperCase();

    return {
      stac_version: '1.0.0',
      stac_extensions: [
        'https://ifrcgo.org/monty-stac-extension/v1.1.0/schema.json',
      ],
      type: 'Feature',
      id,
      collection: 'nlrc-ibf',
      bbox: await this.getBbox(placeCodes),
      geometry: await this.getCentroid(placeCodes),
      properties: {
        title: `${DISASTER_TYPE_LABEL[event.disasterType]} in ${event.countryCodeISO3}`,
        description: `${DISASTER_TYPE_LABEL[event.disasterType]} in ${event.countryCodeISO3} from: ${format(event.firstIssuedDate, dateFormat)} to: ${format(event.endDate, dateFormat)}.`,
        datetime: event.firstIssuedDate,
        start_datetime: event.firstIssuedDate,
        end_datetime: event.endDate,
        modified: event.firstIssuedDate,
        'monty:country_codes': [country.countryCodeISO3],
        'monty:hazard_codes': [DISASTER_TYPE_CODE[event.disasterType]],
        'monty:corr_id': correlationId,
        roles: ['event', 'source'],
        keywords: [
          'IBF',
          event.disasterType,
          DISASTER_TYPE_LABEL[event.disasterType],
          DISASTER_TYPE_CODE[event.disasterType],
          country.countryCodeISO3,
          country.countryName,
          event.eventName,
        ],
      },
      links: [
        { href: DASHBOARD_URL, rel: 'via' },
        {
          href: `${API_SERVICE_URL}/event?countryCodeISO3=${event.countryCodeISO3}&disasterType=${event.disasterType}`,
          rel: 'self',
          roles: ['event'],
          type: 'application/json',
        },
      ],
    };
  }

  // NOTE: the below functions are here instead of admin area service
  // to avoid circular dependency
  public async getBbox(placeCodes: string[]) {
    const { bbox } = await this.adminAreaRepository
      .createQueryBuilder('aa')
      .select('ST_Extent(aa.geom)', 'bbox')
      .where('aa.placeCode IN (:...placeCodes)', { placeCodes })
      .getRawOne();

    const coordinates = bbox.slice(4, -1).split(',');
    const [minX, minY] = coordinates[0].trim().split(' ').map(Number);
    const [maxX, maxY] = coordinates[1].trim().split(' ').map(Number);

    return [minX, minY, maxX, maxY];
  }

  public async getCentroid(placeCodes: string[]) {
    const { centroid } = await this.adminAreaRepository
      .createQueryBuilder('aa')
      .select('ST_AsGeoJSON(ST_Centroid(ST_Union(aa.geom)))', 'centroid')
      .where('aa.placeCode IN (:...placeCodes)', { placeCodes })
      .getRawOne();

    return JSON.parse(centroid);
  }
}
