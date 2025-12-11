import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, UpdateResult } from 'typeorm';

import { HelperService } from '../../shared/helper.service';
import {
  DynamicIndicator,
  FORECAST_SEVERITY,
  FORECAST_TRIGGER,
} from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { CountryDisasterType } from '../country/country-disaster.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { SetTriggerDto } from '../event/dto/event-place-code.dto';
import {
  ALERT_LEVEL_FORECAST_SEVERITY,
  AlertLevel,
} from '../event/enum/alert-level.enum';
import { EventService } from '../event/event.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { NotificationApiTestResponseDto } from '../notification/dto/notification-api-test-response.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProcessEventsService {
  @InjectRepository(EventPlaceCodeEntity)
  private readonly eventPlaceCodeRepository: Repository<EventPlaceCodeEntity>;

  public constructor(
    private eventService: EventService,
    private helperService: HelperService,
    private notificationService: NotificationService,
  ) {}

  public async processEvents(
    countryCodeISO3: string,
    disasterType: DisasterType,
    noNotifications: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const activeEventNames = await this.eventService.getActiveEventNames(
      countryCodeISO3,
      disasterType,
      lastUploadDate,
    );

    const defaultAdminLevel = (
      await this.eventService.getCountryDisasterSettings(
        countryCodeISO3,
        disasterType,
      )
    ).defaultAdminLevel;
    for (const eventName of activeEventNames) {
      if (eventName.eventName === null) {
        await this.eventService.insertAlertsPerLeadTime(
          countryCodeISO3,
          disasterType,
          null,
          [],
          lastUploadDate,
        );
        continue;
      }

      await this.eventService.processEventAreas(
        countryCodeISO3,
        disasterType,
        defaultAdminLevel,
        eventName.eventName,
        lastUploadDate,
      );
    }

    await this.eventService.closeEventsAutomatic(
      countryCodeISO3,
      disasterType,
      lastUploadDate,
    );

    return await this.notificationService.send(
      countryCodeISO3,
      disasterType,
      noNotifications,
      lastUploadDate,
    );
  }

  public async notify(
    countryCodeISO3: string,
    disasterType: DisasterType,
    noNotifications: boolean,
  ): Promise<void | NotificationApiTestResponseDto> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    return await this.notificationService.send(
      countryCodeISO3,
      disasterType,
      noNotifications,
      lastUploadDate,
    );
  }

  public async setTrigger(
    userId: string,
    setTriggerDto: SetTriggerDto,
  ): Promise<UpdateResult> {
    const updateResult = await this.eventPlaceCodeRepository.update(
      setTriggerDto.eventPlaceCodeIds,
      { userTrigger: true, userTriggerDate: new Date(), user: { userId } },
    );

    await this.notify(
      setTriggerDto.countryCodeISO3,
      setTriggerDto.disasterType,
      setTriggerDto.noNotifications,
    );

    return updateResult;
  }

  public async getEvents({
    countryCodeISO3,
    disasterType,
    active = true,
  }: CountryDisasterType & { active: boolean }) {
    const query = this.eventPlaceCodeRepository
      .createQueryBuilder('epc')
      .select('epc.eventName', 'name')
      .addSelect('MIN(epc.firstIssuedDate)', 'startDate')
      .addSelect('MAX(epc.endDate)', 'endDate')
      .addSelect('epc.disasterType', 'hazard')
      .groupBy('epc.eventName')
      .addGroupBy('epc.disasterType')
      .addSelect('aa.countryCodeISO3', 'country')
      // calculate exposed using various indicators
      .addSelect(
        `SUM(
           CASE
               WHEN
                   aadd.indicator IN (
                       '${DynamicIndicator.populationAffected}',
                       '${DynamicIndicator.affectedPopulation}',
                       '${DynamicIndicator.potentialCases}'
                    )
                THEN
                    aadd.value
                ELSE
                    0
           END
        )::BIGINT`,
        'exposed',
      )
      // calculate alertlevel based on forecastSeverity and forecastTrigger
      .addSelect(
        `CASE
             WHEN
                 MAX(
                     CASE
                         WHEN
                             aadd.indicator = '${FORECAST_TRIGGER}'
                         THEN
                             aadd.value
                         ELSE
                             0
                     END
                  ) = ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.TRIGGER]}
             THEN
                 '${AlertLevel.TRIGGER}'
             WHEN
                 MAX(
                     CASE
                         WHEN
                             aadd.indicator = '${FORECAST_SEVERITY}'
                         THEN
                             aadd.value
                         ELSE
                             0
                     END
                  ) >= ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.WARNINGMEDIUM]}
             THEN
                 '${AlertLevel.WARNING}'
             WHEN
                 MAX(
                     CASE
                         WHEN
                             aadd.indicator = '${FORECAST_SEVERITY}'
                         THEN
                             aadd.value
                         ELSE
                             0
                     END
                  ) >= ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.WARNINGLOW]}
             THEN
                 '${AlertLevel.WARNINGMEDIUM}'
             WHEN
                 MAX(
                     CASE
                         WHEN
                             aadd.indicator = '${FORECAST_SEVERITY}'
                         THEN
                             aadd.value
                         ELSE
                             0
                     END
                  ) > ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.NONE]}
             THEN
                 '${AlertLevel.WARNINGLOW}'
             ELSE
                 '${AlertLevel.NONE}'
        END`,
        'alertlevel',
      )
      .leftJoin('admin-area', 'aa', 'epc.adminAreaId = aa.id')
      .leftJoin(
        'admin-area-dynamic-data',
        'aadd',
        'epc.eventName = aadd.eventName',
      )
      .groupBy('epc.eventName')
      .addGroupBy('epc.disasterType')
      .addGroupBy('aa.countryCodeISO3')
      .having(
        `NOT BOOL_AND(epc.closed) = :active AND
         (
           CASE
             WHEN
               MAX(
                 CASE WHEN aadd.indicator = '${FORECAST_TRIGGER}' THEN aadd.value ELSE 0 END
               ) = ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.TRIGGER]}
             THEN '${AlertLevel.TRIGGER}'
             WHEN
               MAX(
                 CASE WHEN aadd.indicator = '${FORECAST_SEVERITY}' THEN aadd.value ELSE 0 END
               ) >= ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.WARNINGMEDIUM]}
             THEN '${AlertLevel.WARNING}'
             WHEN
               MAX(
                 CASE WHEN aadd.indicator = '${FORECAST_SEVERITY}' THEN aadd.value ELSE 0 END
               ) >= ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.WARNINGLOW]}
             THEN '${AlertLevel.WARNINGMEDIUM}'
             WHEN
               MAX(
                 CASE WHEN aadd.indicator = '${FORECAST_SEVERITY}' THEN aadd.value ELSE 0 END
               ) > ${ALERT_LEVEL_FORECAST_SEVERITY[AlertLevel.NONE]}
             THEN '${AlertLevel.WARNINGLOW}'
             ELSE '${AlertLevel.NONE}'
           END != '${AlertLevel.NONE}'
         )`,
        { active },
      )
      .orderBy('"startDate"', 'DESC');

    if (countryCodeISO3) {
      query.andWhere('aa.countryCodeISO3 = :countryCodeISO3', {
        countryCodeISO3,
      });
    }

    if (disasterType) {
      query.andWhere('epc.disasterType = :disasterType', { disasterType });
    }

    const events = await query.getRawMany();

    return events.map((event) => ({
      ...event,
      exposed: Number(event.exposed),
    }));
  }
}
