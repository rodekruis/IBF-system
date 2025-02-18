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
import { ALERT_THRESHOLD } from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
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
import {
  ActivationLogDto,
  AffectedAreaDto,
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
        'MAX(event."forecastTrigger"::int)::boolean AS "forecastTrigger"',
        'SUM(CASE WHEN event."mainExposureValue" > 0 OR event."forecastSeverity" > 0 THEN 1 ELSE 0 END) AS "nrAlertAreas"', // This count is needed here, because the portal also needs the count of other events when in event view, which it cannot get any more from the triggeredAreas array length, which is then filtered on selected event only
        'MAX(event."forecastSeverity")::float AS "forecastSeverity"',
        'sum(event."mainExposureValue")::int AS "mainExposureValueSum"',
      ])
      .andWhere('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      });
  }

  public async getLastUploadDate(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<LastUploadDateDto> {
    return this.helperService.getLastUploadDate(countryCodeISO3, disasterType);
  }

  // NOTE: remove after all pipelines migrated to new endpoint
  public async convertDtoAndUpload(
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
    leadTime: string,
    eventName: string,
  ): Promise<AlertArea[]> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const defaultAdminLevel = (
      await this.getCountryDisasterSettings(countryCodeISO3, disasterType)
    ).defaultAdminLevel;

    const whereFiltersDynamicData = {
      indicator: ALERT_THRESHOLD,
      value: MoreThan(0),
      adminLevel,
      disasterType,
      countryCodeISO3,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastUploadDate.timestamp,
        ),
      ),
    };
    if (eventName) {
      whereFiltersDynamicData['eventName'] = eventName;
    }
    if (leadTime) {
      whereFiltersDynamicData['leadTime'] = leadTime;
    }
    const alertAreasRaw = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .select(['dynamic.placeCode AS "placeCode"'])
      .where(whereFiltersDynamicData)
      .execute();
    const alertPlaceCodes = alertAreasRaw.map((element) => element.placeCode);

    if (adminLevel > defaultAdminLevel) {
      // Use this to also return something on deeper levels than default (to show in chat-section)
      return this.getDeeperAlertAreas(
        alertPlaceCodes,
        disasterType,
        lastUploadDate.timestamp,
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
    const alertAreas = await this.eventPlaceCodeRepo
      .createQueryBuilder('event')
      .select([
        'area."placeCode" AS "placeCode"',
        'area.name AS name',
        'area."adminLevel" AS "adminLevel"',
        'event."mainExposureValue"',
        'event."forecastSeverity"',
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
      .andWhere(
        '(event."mainExposureValue" > 0 OR event."forecastSeverity" > 0)',
      )
      .orderBy('event."mainExposureValue"', 'DESC')
      .getRawMany();

    for (const area of alertAreas) {
      if (alertPlaceCodes.length === 0) {
        area.eapActions = [];
      } else if (area.forecastSeverity < 1) {
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
    triggeredPlaceCodes: string[],
    disasterType: DisasterType,
    lastUploadTimestamp: Date,
    eventName?: string,
    leadTime?: string,
  ): Promise<AlertArea[]> {
    const mainExposureIndicator =
      await this.getMainExposureIndicator(disasterType);
    const whereFilters = {
      placeCode: In(triggeredPlaceCodes),
      indicator: mainExposureIndicator,
      disasterType,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastUploadTimestamp,
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
        mainExposureValue: area.value,
        forecastSeverity: null, // leave empty for now, as we don't show forecastSeverity on deeper levels
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
        'event.closed as closed',
        'case when event.closed = true then event."endDate" end as "endDate"',
        'disaster."mainExposureIndicator" as "exposureIndicator"',
        'event."mainExposureValue" as "exposureValue"',
        `CASE event."forecastSeverity" WHEN 1 THEN 'Trigger/alert' WHEN 0.7 THEN 'Medium warning' WHEN 0.3 THEN 'Low warning' END as "alertClass"`, // NOTE AB#32041: Check this
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
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastUploadDate.timestamp,
        ),
      ),
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
    const pipelineRunEventNames = await this.getActiveEventNames(
      countryCodeISO3,
      disasterType,
      lastUploadDate,
    );

    const defaultAdminLevel = (
      await this.getCountryDisasterSettings(countryCodeISO3, disasterType)
    ).defaultAdminLevel;
    for (const eventName of pipelineRunEventNames) {
      await this.processEventAreas(
        countryCodeISO3,
        disasterType,
        defaultAdminLevel,
        eventName.eventName,
        lastUploadDate.timestamp,
      );
    }

    await this.closeEventsAutomatic(countryCodeISO3, disasterType);

    // NOTE: also include the functionality of /notification/send endpoint here
  }

  private async getActiveEventNames(
    countryCodeISO3: string,
    disasterType: DisasterType,
    lastUploadDate: LastUploadDateDto,
  ) {
    const whereFilters = {
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastUploadDate.timestamp,
        ),
      ),
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
    lastUploadTimestamp: Date,
  ): Promise<void> {
    // First delete duplicate events for upload within same time-block
    await this.deleteDuplicateEvents(
      countryCodeISO3,
      disasterType,
      eventName,
      lastUploadTimestamp,
    );

    const affectedAreas = await this.getAffectedAreas(
      countryCodeISO3,
      disasterType,
      adminLevel,
      eventName,
      lastUploadTimestamp,
    );

    // update existing event areas + update population and end_date
    await this.updateExistingEventAreas(
      countryCodeISO3,
      disasterType,
      eventName,
      affectedAreas,
    );

    // add new event areas
    await this.addNewEventAreas(
      countryCodeISO3,
      disasterType,
      eventName,
      affectedAreas,
    );
  }

  // NOTE AB#32041 REFACTOR: call this getAlertAreas but then it becomes duplicate. Figure out the difference and if they can be combined.
  private async getAffectedAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    eventName: string,
    lastUploadTimestamp: Date,
  ): Promise<AffectedAreaDto[]> {
    const whereFilters = {
      indicator: ALERT_THRESHOLD,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastUploadTimestamp,
        ),
      ),
      countryCodeISO3,
      adminLevel,
      disasterType,
      eventName: eventName || IsNull(),
    };

    // NOTE AB#32041: this currently gets forecastSeverity based on layer identified by alert_threshold. This must change (and be made more flexible in transition period)
    const alertPlaceCodes = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('area')
      .select('area."placeCode"')
      .addSelect('MAX(area.value) AS "forecastSeverity"')
      .where(whereFilters)
      .andWhere(
        `(area.value > 0 OR (area."eventName" is not null AND area."disasterType" IN ('flash-floods','typhoon')))`,
      ) // Also allow value=0 entries with typhoon/flash-floods and event name (= warning event) // NOTE AB#32041: this check should be possible to remove after this item
      .groupBy('area."placeCode"')
      .getRawMany();

    const alertPlaceCodesArray = alertPlaceCodes.map((a) => a.placeCode);

    if (alertPlaceCodesArray.length === 0) {
      return [];
    }

    const mainExposureIndicator =
      await this.getMainExposureIndicator(disasterType);

    const whereOptions = {
      placeCode: In(alertPlaceCodesArray),
      indicator: mainExposureIndicator,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastUploadTimestamp,
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
      .addSelect('MAX(area.value) AS "mainExposureValue"')
      .addSelect('MAX(area."leadTime") AS "leadTime"')
      .where(whereOptions)
      .groupBy('area."placeCode"')
      .getRawMany();

    for (const area of affectedAreas) {
      area.forecastSeverity = alertPlaceCodes.find(
        ({ placeCode }) => placeCode === area.placeCode,
      ).forecastSeverity;
    }

    return affectedAreas;
  }

  private async updateExistingEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    affectedAreas: AffectedAreaDto[],
  ): Promise<void> {
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
    const idsToUpdateTrigger = [];
    const idsToUpdateWarning = [];
    const lastUploadDate = await this.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    unclosedEventAreas.forEach((eventArea) => {
      const affectedArea = affectedAreas.find(
        (area) => area.placeCode === eventArea.adminArea.placeCode,
      );
      if (affectedArea) {
        eventArea.endDate = lastUploadDate.timestamp;
        if (affectedArea.forecastSeverity === 1) {
          eventArea.forecastTrigger = true; // NOTE AB#32041: for now just rename done, but this functionality will change based on the new input
          idsToUpdateTrigger.push(eventArea.eventPlaceCodeId);
        } else {
          eventArea.forecastTrigger = false;
          idsToUpdateWarning.push(eventArea.eventPlaceCodeId);
        }
      }
    });
    // .. first fire one query to update all rows that need forecastTrigger = true
    await this.updateEvents(idsToUpdateTrigger, true, lastUploadDate.timestamp);

    // .. then fire one query to update all rows that need forecastTrigger = false
    await this.updateEvents(
      idsToUpdateWarning,
      false,
      lastUploadDate.timestamp,
    );

    // .. lastly we update those records where mainExposureValue or forecastSeverity changed
    await this.updateValues(unclosedEventAreas, affectedAreas);
  }

  private async updateEvents(
    eventPlaceCodeIds: string[],
    forecastTrigger: boolean,
    endDate: Date,
  ) {
    if (eventPlaceCodeIds.length) {
      await this.eventPlaceCodeRepo
        .createQueryBuilder()
        .update()
        .set({ forecastTrigger, endDate })
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
        (eventArea.mainExposureValue !== affectedArea.mainExposureValue ||
          eventArea.forecastSeverity !== affectedArea.forecastSeverity)
      ) {
        eventArea.forecastSeverity = affectedArea.forecastSeverity;
        eventArea.mainExposureValue = affectedArea.mainExposureValue;
        eventAreasToUpdate.push(
          `('${eventArea.eventPlaceCodeId}',${eventArea.mainExposureValue},${eventArea.forecastSeverity})`,
        );
      }
    }
    if (eventAreasToUpdate.length) {
      const repository = this.dataSource.getRepository(EventPlaceCodeEntity);
      const updateQuery = `UPDATE \
      "${repository.metadata.schema}"."${repository.metadata.tableName}" epc \
      SET \
          "mainExposureValue" = areas.mainExposureValue::double precision, \
          "forecastSeverity" = areas.forecastSeverity::double precision \
      FROM \
         (VALUES ${eventAreasToUpdate.join(',')}) \
         areas(id, mainExposureValue, forecastSeverity) \
      WHERE \
          areas.id::uuid = epc."eventPlaceCodeId" \
      `;
      await this.dataSource.query(updateQuery);
    }
  }

  private async addNewEventAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    eventName: string,
    affectedAreas: AffectedAreaDto[],
  ): Promise<void> {
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
    const startDate = await this.helperService.getLastUploadDate(
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
        eventArea.forecastTrigger = area.forecastSeverity === 1;
        eventArea.forecastSeverity = area.forecastSeverity;
        eventArea.mainExposureValue = +area.mainExposureValue;
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
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const where = {
      endDate: LessThan(lastUploadDate.timestamp), // If the area was not prolonged earlier, then the endDate is not updated and is therefore less than the lastUploadDate
      adminArea: In(countryAdminAreaIds),
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
