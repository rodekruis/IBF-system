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
  AlertArea,
  DisasterSpecificProperties,
  EventSummaryCountry,
} from '../../shared/data.model';
import { HelperService } from '../../shared/helper.service';
import { ALERT_LEVEL_INDICATORS } from '../admin-area-dynamic-data/const/alert-level-indicators.const';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryDisasterSettingsEntity } from '../country/country-disaster.entity';
import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { TyphoonTrackService } from '../typhoon-track/typhoon-track.service';
import { UserEntity } from '../user/user.entity';
import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { EapActionsService } from './../eap-actions/eap-actions.service';
import { AlertPerLeadTimeEntity } from './alert-per-lead-time.entity';
import { AreaForecastDataDto } from './dto/area-forecast-data.dto';
import {
  ActivationLogDto,
  EventPlaceCodeDto,
} from './dto/event-place-code.dto';
import { LastUploadDateDto } from './dto/last-upload-date.dto';
import {
  UploadAlertPerLeadTimeDto,
  uploadTriggerPerLeadTimeDto,
} from './dto/upload-alert-per-leadtime.dto';
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
    const lastUploadDate = await this.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const eventSummaryQueryBuilder = this.createEventSummaryQueryBuilder(
      countryCodeISO3,
    ).andWhere({
      closed: false,
      endDate: MoreThanOrEqual(lastUploadDate.date),
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
          event.forecastSeverity,
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
        'SUM(CASE WHEN event."forecastSeverity" > 0 THEN 1 ELSE 0 END) AS "nrAlertAreas"', // This count is needed here, because the portal also needs the count of other events when in event view, which it cannot get any more from the triggeredAreas array length, which is then filtered on selected event only
        'MAX(event."forecastSeverity")::float AS "forecastSeverity"',
        'MAX(event."forecastTrigger"::int)::boolean AS "forecastTrigger"',
        'sum(event."mainExposureValue")::int AS "mainExposureValueSum"',
      ])
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
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
    uploadTriggerPerLeadTimeDto: uploadTriggerPerLeadTimeDto,
  ) {
    const uploadAlertPerLeadTimeDto = new UploadAlertPerLeadTimeDto();
    uploadAlertPerLeadTimeDto.countryCodeISO3 =
      uploadTriggerPerLeadTimeDto.countryCodeISO3;
    uploadAlertPerLeadTimeDto.disasterType =
      uploadTriggerPerLeadTimeDto.disasterType;
    uploadAlertPerLeadTimeDto.eventName = uploadTriggerPerLeadTimeDto.eventName;
    uploadAlertPerLeadTimeDto.date = uploadAlertPerLeadTimeDto.date;
    uploadAlertPerLeadTimeDto.alertsPerLeadTime =
      uploadTriggerPerLeadTimeDto.triggersPerLeadTime.map((trigger) => {
        return {
          leadTime: trigger.leadTime,
          forecastAlert: trigger.triggered,
          forecastTrigger: trigger.thresholdReached,
        };
      });
    await this.uploadAlertPerLeadTime(uploadAlertPerLeadTimeDto);
  }

  public async uploadAlertPerLeadTime(
    uploadAlertPerLeadTimeDto: UploadAlertPerLeadTimeDto,
  ): Promise<void> {
    uploadAlertPerLeadTimeDto.date = this.helperService.setDayToLastDayOfMonth(
      uploadAlertPerLeadTimeDto.date,
      uploadAlertPerLeadTimeDto.alertsPerLeadTime[0].leadTime,
    );
    const alertsPerLeadTime: AlertPerLeadTimeEntity[] = [];
    const timestamp = uploadAlertPerLeadTimeDto.date || new Date();
    for (const leadTime of uploadAlertPerLeadTimeDto.alertsPerLeadTime) {
      // Delete existing entries in case of a re-run of the pipeline within the same time period
      await this.deleteDuplicates(uploadAlertPerLeadTimeDto);

      const alertPerLeadTime = new AlertPerLeadTimeEntity();
      alertPerLeadTime.date = uploadAlertPerLeadTimeDto.date || new Date();
      alertPerLeadTime.timestamp = timestamp;
      alertPerLeadTime.countryCodeISO3 =
        uploadAlertPerLeadTimeDto.countryCodeISO3;
      alertPerLeadTime.leadTime = leadTime.leadTime as LeadTime;
      alertPerLeadTime.forecastAlert = leadTime.forecastAlert;
      alertPerLeadTime.forecastTrigger = leadTime.forecastTrigger;
      alertPerLeadTime.disasterType = uploadAlertPerLeadTimeDto.disasterType;
      alertPerLeadTime.eventName = uploadAlertPerLeadTimeDto.eventName;

      alertsPerLeadTime.push(alertPerLeadTime);
    }

    await this.alertPerLeadTimeRepository.save(alertsPerLeadTime);
  }

  private async deleteDuplicates(
    uploadAlertPerLeadTimeDto: UploadAlertPerLeadTimeDto,
  ): Promise<void> {
    const deleteFilters = {
      countryCodeISO3: uploadAlertPerLeadTimeDto.countryCodeISO3,
      disasterType: uploadAlertPerLeadTimeDto.disasterType,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          uploadAlertPerLeadTimeDto.disasterType,
          uploadAlertPerLeadTimeDto.date,
        ),
      ),
      leadTime: In(
        uploadAlertPerLeadTimeDto.alertsPerLeadTime.map((a) => a.leadTime),
      ),
    };
    if (uploadAlertPerLeadTimeDto.eventName) {
      deleteFilters['eventName'] = uploadAlertPerLeadTimeDto.eventName;
    }
    await this.alertPerLeadTimeRepository.delete(deleteFilters);
  }

  private async deleteDuplicateEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    uploadCutoffMoment: Date,
  ): Promise<void> {
    const deleteFilters = {
      adminArea: { countryCodeISO3 },
      disasterType,
      startDate: MoreThanOrEqual(uploadCutoffMoment),
    };
    if (eventName) {
      deleteFilters['eventName'] = eventName;
    }
    const eventAreasToDelete = await this.eventPlaceCodeRepo.find({
      where: deleteFilters,
    });
    await this.eventPlaceCodeRepo.remove(eventAreasToDelete);
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
      lastUploadDate.cutoffMoment,
      eventName,
    );
    const { defaultAdminLevel } = await this.getCountryDisasterSettings(
      countryCodeISO3,
      disasterType,
    );
    const alertPlaceCodes = activeAlertAreas.map(({ placeCode }) => placeCode);

    if (adminLevel > defaultAdminLevel) {
      // Use this to also return something on deeper levels than default (to show in chat-section)
      return this.getDeeperAlertAreas(
        alertPlaceCodes,
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

    const alertAreas = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'area."adminLevel" AS "adminLevel"',
        'event."mainExposureValue"',
        'event."forecastSeverity"',
        'event."forecastTrigger"',
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
      .orderBy('event."mainExposureValue"', 'DESC')
      .getRawMany();

    for (const area of alertAreas) {
      if (alertPlaceCodes.length === 0) {
        area.eapActions = [];
      } else if (!area.forecastTrigger) {
        // Do not show actions for warning events/areas
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

    return alertAreas;
  }

  private async getDeeperAlertAreas(
    alertPlaceCodes: string[],
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
    eventName?: string,
    leadTime?: string,
  ): Promise<AlertArea[]> {
    const mainExposureIndicator =
      await this.getMainExposureIndicator(disasterType);

    const whereFilters = {
      placeCode: In(alertPlaceCodes),
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

    return areas.map((area) => ({
      placeCode: area.placeCode,
      name: area.name,
      nameParent: null,
      mainExposureValue: area.value,
      forecastSeverity: null, // leave empty for now, as we don't show forecastSeverity on deeper levels
      stopped: area.stopped,
      startDate: area.startDate,
      stoppedDate: area.stoppedDate,
      displayName: area.displayName,
      eapActions: [],
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
        'event."startDate"',
        'event.closed as closed',
        'case when event.closed = true then event."endDate" end as "endDate"',
        'disaster."mainExposureIndicator" as "exposureIndicator"',
        'event."mainExposureValue" as "exposureValue"',
        `CASE
        WHEN event."forecastTrigger" = true THEN 'Trigger'
        WHEN event."forecastSeverity" = 1 THEN 'High warning'
        WHEN event."forecastSeverity" = 0.7 THEN 'Medium warning'
        WHEN event."forecastSeverity" = 0.3 THEN 'Low warning'
        END as "alertClass"`,
        'event."eventPlaceCodeId" as "databaseId"',
      ])
      .leftJoin('event.adminArea', 'area')
      .leftJoin('event.disasterType', 'disaster')
      .where({ forecastSeverity: MoreThan(0) })
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
    const timesteps = await this.getAlertPerLeadtime(
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
            if (timesteps[`${key}-forecastTrigger`] === '1') {
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

  public async getAlertPerLeadtime(
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
      return;
    }
    const result = {
      date: alertsPerLeadTime[0].date,
    };
    for (const leadTimeKey in LeadTime) {
      const leadTimeUnit = LeadTime[leadTimeKey];
      const leadTimeIsAlerted = alertsPerLeadTime.find(
        (el): boolean => el.leadTime === leadTimeUnit,
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

  public async processEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<void> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const activeEventNames = await this.getActiveEventNames(
      countryCodeISO3,
      disasterType,
      lastUploadDate.cutoffMoment,
    );
    const { defaultAdminLevel } = await this.getCountryDisasterSettings(
      countryCodeISO3,
      disasterType,
    );

    for (const eventName of activeEventNames) {
      if (eventName.eventName === null) {
        await this.insertAlertsPerLeadTime(
          countryCodeISO3,
          disasterType,
          null,
          [],
          lastUploadDate.timestamp,
        );
        continue;
      }

      await this.processEventAreas(
        countryCodeISO3,
        disasterType,
        defaultAdminLevel,
        eventName.eventName,
        lastUploadDate.cutoffMoment,
        lastUploadDate.timestamp,
      );
    }

    await this.closeEventsAutomatic(
      countryCodeISO3,
      disasterType,
      lastUploadDate.timestamp,
    );

    // NOTE AB#32041: also include the functionality of /notification/send endpoint here
  }

  private async getActiveEventNames(
    countryCodeISO3: string,
    disasterType: DisasterType,
    uploadCutoffMoment: Date,
  ) {
    const whereFilters = {
      timestamp: MoreThanOrEqual(uploadCutoffMoment),
      countryCodeISO3,
      disasterType,
    };
    return await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select('dynamic."eventName"')
      .where(whereFilters)
      .groupBy('dynamic."eventName"')
      .getRawMany();
  }

  private async processEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
    uploadCutoffMoment: Date,
    lastUploadTimestamp: Date,
  ): Promise<void> {
    // First delete duplicate events for upload within same time-block
    // REFACTOR: evaluate if this is still needed. The overwriting should be necessary only on raw input (admin-area-dynamic-data) not on this derived data?
    await this.deleteDuplicateEvents(
      countryCodeISO3,
      disasterType,
      eventName,
      uploadCutoffMoment,
    );

    const activeAlertAreas = await this.getActiveAlertAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      uploadCutoffMoment,
      eventName,
    );

    await this.insertAlertsPerLeadTime(
      countryCodeISO3,
      disasterType,
      eventName,
      activeAlertAreas,
      lastUploadTimestamp,
    );

    // update existing event areas + update population and end_date
    await this.updateExistingEventAreas(
      countryCodeISO3,
      disasterType,
      eventName,
      activeAlertAreas,
      lastUploadTimestamp,
    );

    // add new event areas
    await this.addNewEventAreas(
      countryCodeISO3,
      disasterType,
      eventName,
      activeAlertAreas,
      lastUploadTimestamp,
    );
  }

  // NOTE AB#32041 REFACTOR: Figure out the difference with getAlertAreas and see if they can be combined.
  public async getActiveAlertAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    uploadCutoffMoment: Date,
    eventName?: string,
  ): Promise<AreaForecastDataDto[]> {
    const whereFilters = {
      timestamp: MoreThanOrEqual(uploadCutoffMoment),
      countryCodeISO3,
      adminLevel,
      disasterType,
    };
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }
    const mainExposureIndicator =
      await this.getMainExposureIndicator(disasterType);
    const areaswithForecastSeverityData = await this.adminAreaDynamicDataRepo
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
        { forecastTrigger: ALERT_LEVEL_INDICATORS.forecastTrigger },
      )
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'exposure',
        `severity.placeCode = exposure."placeCode"
        AND severity.timestamp = exposure."timestamp"
        AND severity.eventName = exposure."eventName"
        AND severity.disasterType = exposure."disasterType"
        AND severity.leadTime = exposure."leadTime"
        AND severity.indicator = :mainExposureIndicator`,
        { mainExposureIndicator },
      )
      .where({
        ...whereFilters,
        indicator: ALERT_LEVEL_INDICATORS.forecastSeverity,
        value: MoreThan(0),
      })
      .getRawMany();

    // This "if" assumes that if forecast_severity is present for 1 area it is present for all
    if (areaswithForecastSeverityData.length) {
      return areaswithForecastSeverityData.map((area) => ({
        placeCode: area.placeCode,
        leadTime: area.leadTime as LeadTime,
        forecastSeverity: area.forecastSeverity,
        forecastTrigger: area.forecastTrigger === 1 ? true : false, // This reflects that forecastTrigger is optional (and assumed false if not present) and that this boolean layer is uploaded in practice as 1/0.
        mainExposureValue: area.mainExposureValue,
      }));
    } else {
      // NOTE: remove after all pipelines migrated to new setup
      // NOTE: this query could potentially be included in the query above for optimization, but not worth it for transition period only
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
          indicator: ALERT_LEVEL_INDICATORS.alertThreshold,
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

  private async insertAlertsPerLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    activeAlertAreas: AreaForecastDataDto[],
    lastUploadTimestamp: Date,
  ) {
    if (!activeAlertAreas.length) {
      return;
    }

    const uploadAlertPerLeadTimeDto = new UploadAlertPerLeadTimeDto();
    uploadAlertPerLeadTimeDto.countryCodeISO3 = countryCodeISO3;
    uploadAlertPerLeadTimeDto.disasterType = disasterType;
    uploadAlertPerLeadTimeDto.eventName = eventName;
    uploadAlertPerLeadTimeDto.date = lastUploadTimestamp;
    if (activeAlertAreas.length) {
      // TODO: improve this to not be dependent on first array-element (although in practice this should work as leadTime should be equal for all eventName records)
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
        lastUploadTimestamp,
      );
      uploadAlertPerLeadTimeDto.alertsPerLeadTime = noEventLeadTimes.map(
        (leadTime) => ({
          leadTime,
          forecastAlert: false,
          forecastTrigger: false,
        }),
      );
    }

    await this.uploadAlertPerLeadTime(uploadAlertPerLeadTimeDto);
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
        (settings) => settings.disasterType === disasterType,
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
      (s) => s.disasterType === DisasterType.Drought,
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
    lastUploadTimestamp: Date,
  ): Promise<void> {
    const openEventAreas = await this.eventPlaceCodeRepo.find({
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
    openEventAreas.forEach((openEventArea) => {
      const activeAlertArea = activeAlertAreas.find(
        (area) => area.placeCode === openEventArea.adminArea.placeCode,
      );
      if (activeAlertArea) {
        if (activeAlertArea.forecastTrigger) {
          openEventArea.forecastTrigger = true;
          triggerAreaIdsToUpdate.push(openEventArea.eventPlaceCodeId);
        } else {
          openEventArea.forecastTrigger = false;
          warningAreaIdsToUpdate.push(openEventArea.eventPlaceCodeId);
        }

        // NOTE: for performance reasons only update if values actually changed. Otherwise unneeded queries per area are fired.
        if (
          openEventArea.forecastSeverity !== activeAlertArea.forecastSeverity ||
          openEventArea.mainExposureValue !== activeAlertArea.mainExposureValue
        ) {
          openEventArea.forecastSeverity = activeAlertArea.forecastSeverity;
          openEventArea.mainExposureValue = activeAlertArea.mainExposureValue;
          areasToUpdate.push(openEventArea);
        }
      }
    });

    const endDate = lastUploadTimestamp;
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

  private async updateOtherEventData(openEventAreas: EventPlaceCodeEntity[]) {
    if (!openEventAreas.length) {
      return;
    }

    const eventAreasInput = openEventAreas.map(
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
    lastUploadTimestamp: Date,
  ): Promise<void> {
    const openEventAreaPlaceCodes = (
      await this.eventPlaceCodeRepo.find({
        where: {
          closed: false,
          adminArea: { countryCodeISO3 },
          disasterType,
          eventName: eventName || IsNull(),
        },
        relations: ['adminArea'],
      })
    ).map((area) => area.adminArea.placeCode);
    const newEventAreas: EventPlaceCodeEntity[] = [];
    for await (const activeAlertArea of activeAlertAreas) {
      if (!openEventAreaPlaceCodes.includes(activeAlertArea.placeCode)) {
        const adminArea = await this.adminAreaRepository.findOne({
          where: { placeCode: activeAlertArea.placeCode },
        });
        const eventArea = new EventPlaceCodeEntity();
        eventArea.adminArea = adminArea;
        eventArea.eventName = eventName;
        eventArea.forecastTrigger = activeAlertArea.forecastTrigger;
        eventArea.forecastSeverity = activeAlertArea.forecastSeverity;
        eventArea.mainExposureValue = +activeAlertArea.mainExposureValue;
        eventArea.startDate = lastUploadTimestamp;
        eventArea.endDate = lastUploadTimestamp;
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
    lastUploadTimestamp: Date,
  ) {
    const where = {
      endDate: LessThan(lastUploadTimestamp), // If the area was not prolonged earlier, then the endDate is not updated and is therefore less than the lastUploadDate
      adminArea: { countryCodeISO3 },
      disasterType,
      closed: false,
    };
    const expiredEventAreas = await this.eventPlaceCodeRepo.find({ where });

    // Warning events are removed from this table after closing to clean up
    const belowThresholdEvents = expiredEventAreas.filter(
      ({ forecastTrigger: forecastTrigger }) => !forecastTrigger,
    );
    await this.eventPlaceCodeRepo.remove(belowThresholdEvents);

    //For the other ones update 'closed = true'
    const aboveThresholdEvents = expiredEventAreas.filter(
      ({ forecastTrigger: forecastTrigger }) => forecastTrigger,
    );
    for (const area of aboveThresholdEvents) {
      area.closed = true;
    }
    await this.eventPlaceCodeRepo.save(aboveThresholdEvents);
  }

  private async getEventEapAlertClass(
    disasterSettings: CountryDisasterSettingsEntity,
    eventForecastSeverity: number,
  ): Promise<DisasterSpecificProperties> {
    const eapAlertClasses = JSON.parse(
      JSON.stringify(disasterSettings.eapAlertClasses),
    );
    const alertClassKey = Object.keys(eapAlertClasses).find(
      (key) => eapAlertClasses[key].value === eventForecastSeverity,
    );

    return {
      eapAlertClass: {
        key: alertClassKey,
        ...eapAlertClasses[alertClassKey],
      },
    };
  }
}
