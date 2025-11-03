/* eslint-disable perfectionist/sort-enums */
import { Injectable } from '@angular/core';
import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
} from 'date-fns';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { BREADCRUMB_DISASTERS } from 'src/app/components/admin-level/admin-level.component';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { AlertArea } from 'src/app/types/alert-area';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import { LastUploadDate } from 'src/app/types/last-upload-date';
import {
  LeadTime,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';

export class Event {
  countryCodeISO3: string;
  firstIssuedDate: string;
  endDate: string;
  forecastTrigger: boolean;
  eventName: string;
  firstLeadTime?: LeadTime;
  firstLeadTimeLabel?: string;
  firstLeadTimeDate?: string;
  firstTriggerLeadTime?: LeadTime;
  firstTriggerLeadTimeDate?: string;
  timeUnit?: string;
  duration?: number;
  disasterSpecificProperties: DisasterSpecificProperties;
  header?: string;
  alertAreas?: AlertArea[];
  nrAlertAreas?: number;
  mainExposureValueSum?: number;
  alertLevel: AlertLevel;
  userTrigger: boolean;
  userTriggerDate: string;
  userTriggerName: string;
}

export enum AlertLevel {
  NONE = 'none',
  WARNINGLOW = 'warning-low',
  WARNINGMEDIUM = 'warning-medium',
  WARNING = 'warning',
  TRIGGER = 'trigger',
}

export const ALERT_LEVEL_RANK: Record<AlertLevel, number> = {
  [AlertLevel.NONE]: 4,
  [AlertLevel.WARNINGLOW]: 3,
  [AlertLevel.WARNINGMEDIUM]: 2,
  [AlertLevel.WARNING]: 1,
  [AlertLevel.TRIGGER]: 0,
};

export const ALERT_LEVEL_LABEL: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: 'No Alert',
  [AlertLevel.WARNINGLOW]: 'Low Warning',
  [AlertLevel.WARNINGMEDIUM]: 'Medium Warning',
  [AlertLevel.WARNING]: 'Warning',
  [AlertLevel.TRIGGER]: 'Trigger',
};

export const ALERT_LEVEL_COLOUR: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '#00214d', // fiveten-navy-900
  [AlertLevel.WARNINGLOW]: '#ffd601', // fiveten-yellow-500
  [AlertLevel.WARNINGMEDIUM]: '#da7c00', // fiveten-orange-500
  [AlertLevel.WARNING]: '#da7c00', // fiveten-orange-500
  [AlertLevel.TRIGGER]: '#c70000', // fiveten-red-500
};

export const ALERT_LEVEL_TEXT_COLOUR: Record<AlertLevel, string> = {
  [AlertLevel.NONE]: '#00214d', // fiveten-navy-900
  [AlertLevel.WARNINGLOW]: '#665606', // fiveten-yellow-700
  [AlertLevel.WARNINGMEDIUM]: '#7a2d00', // fiveten-orange-700
  [AlertLevel.WARNING]: '#7a2d00', // fiveten-orange-700
  [AlertLevel.TRIGGER]: '#c70000', // fiveten-red-500
};

export class DisasterSpecificProperties {
  typhoonLandfall?: boolean;
  typhoonNoLandfallYet?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private country: Country;
  private disasterType: DisasterType;
  private countryDisasterSettings: CountryDisasterSettings;

  public nullState: EventState = { events: null, event: null };

  public state = this.nullState;
  public today: DateTime;

  public initialEventStateSubject = new BehaviorSubject<EventState>(
    this.nullState,
  );

  public manualEventStateSubject = new BehaviorSubject<EventState>(
    this.nullState,
  );

  constructor(
    private apiService: ApiService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.resetState();
    this.disasterType = disasterType;

    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );

    this.getEvents();
  };

  public switchEvent(eventName: string) {
    const event = this.state.events.find((e) => e.eventName === eventName);

    // Trigger a different 'event' subject in this case ..
    // .. so that timelineService can distinguish between initial event switch and manual event switch
    this.setEventManually(event);
  }

  public resetEvents() {
    this.setEventInitially(null);
  }

  private setEventInitially(event: Event) {
    this.state.event = event;
    this.initialEventStateSubject.next(this.state);
    this.setAlertState();
  }

  private setEventManually(event: Event) {
    this.state.event = event;
    this.manualEventStateSubject.next(this.state);
    this.setAlertState();
  }

  public getInitialEventStateSubscription(): Observable<EventState> {
    return this.initialEventStateSubject.asObservable();
  }

  public getManualEventStateSubscription(): Observable<EventState> {
    return this.manualEventStateSubject.asObservable();
  }

  private resetState() {
    this.state = this.nullState;
    this.resetEvents();
  }

  public getEvents() {
    if (this.country && this.disasterType) {
      this.apiService
        .getEvents(this.country.countryCodeISO3, this.disasterType.disasterType)
        .subscribe(this.onEvents);
    }
  }

  public getTriggerByDisasterType(
    countryCountryISO3: string,
    disasterType: DisasterType,
    callback: (disasterType: DisasterType) => void,
  ) {
    if (countryCountryISO3 && disasterType) {
      this.apiService
        .getEvents(countryCountryISO3, disasterType.disasterType)
        .subscribe(this.onGetDisasterTypeEvent(disasterType, callback));
    }
  }

  private onGetDisasterTypeEvent = (
    disasterType: DisasterType,
    callback: (disasterType: DisasterType) => void,
  ) => {
    return (events: Event[]) => {
      disasterType.alertLevel = events.some(
        ({ alertLevel }) => alertLevel != AlertLevel.NONE,
      );

      callback(disasterType);
    };
  };

  private onEvents = (events: Event[]) => {
    this.apiService
      .getLastUploadDate(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
      )
      .subscribe((date) => {
        this.onLastUploadDate(date, events);
      });
  };

  private onLastUploadDate = (
    lastUploadDate: LastUploadDate,
    events: Event[],
  ) => {
    if (lastUploadDate.timestamp || lastUploadDate.date) {
      this.today = DateTime.fromISO(
        lastUploadDate.timestamp || lastUploadDate.date,
      );
    } else {
      this.today = DateTime.now();
    }

    this.state.events = events;

    if (events.length) {
      for (const event of this.state.events) {
        event.firstIssuedDate = DateTime.fromISO(
          event.firstIssuedDate,
        ).toFormat('cccc, dd LLLL');

        event.userTriggerDate = DateTime.fromISO(
          event.userTriggerDate,
        ).toFormat('cccc, dd LLLL');

        event.firstLeadTimeLabel = LeadTimeTriggerKey[event.firstLeadTime];
        event.timeUnit = event.firstLeadTime?.split('-')[1];

        event.firstLeadTimeDate = event.firstLeadTime
          ? this.getFirstLeadTimeDate(
              event.firstLeadTime,
              event.timeUnit as LeadTimeUnit,
            )
          : null;

        event.firstTriggerLeadTimeDate = event.firstTriggerLeadTime
          ? this.getFirstLeadTimeDate(
              event.firstTriggerLeadTime,
              event.timeUnit as LeadTimeUnit,
            )
          : null;

        event.duration = this.getEventDuration(event);
        event.nrAlertAreas = event.alertAreas?.length;
      }
    }

    this.sortEvents();

    if (events.length === 1) {
      this.setEventInitially(events[0]);
    } else if (this.skipNationalView(this.disasterType.disasterType)) {
      const triggerEvents = events.filter(
        (e) => e.alertLevel === AlertLevel.TRIGGER,
      );
      const eventToLoad = triggerEvents.length ? triggerEvents[0] : events[0];

      this.setEventInitially(eventToLoad);
    } else {
      this.setEventInitially(null);
    }

    this.setAlertState();
  };

  public skipNationalView(disastertype: DisasterTypeKey) {
    return !BREADCRUMB_DISASTERS.includes(disastertype);
  }

  private sortEvents() {
    this.state.events?.sort((a, b) => {
      const aNoLandfallYet = a.disasterSpecificProperties?.typhoonNoLandfallYet
        ? 1
        : 0;
      const bNoLandfallYet = b.disasterSpecificProperties?.typhoonNoLandfallYet
        ? 1
        : 0;

      if (aNoLandfallYet !== bNoLandfallYet) {
        return aNoLandfallYet - bNoLandfallYet;
      } else if (
        this.leadTimeToNumber(a.firstLeadTime) >
        this.leadTimeToNumber(b.firstLeadTime)
      ) {
        return 1;
      } else if (
        this.leadTimeToNumber(a.firstLeadTime) ===
        this.leadTimeToNumber(b.firstLeadTime)
      ) {
        if (a.duration > b.duration) {
          return 1;
        } else if (a.duration === b.duration) {
          if (a.firstIssuedDate > b.firstIssuedDate) {
            return 1;
          } else if (a.firstIssuedDate === b.firstIssuedDate) {
            if (a.eventName > b.eventName) {
              return 1;
            } else {
              return -1;
            }
          } else {
            return -1;
          }
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    });
  }

  private leadTimeToNumber(leadTime: string) {
    return Number(leadTime?.split('-')[0]);
  }

  private getEventDuration(event: Event) {
    if (this.disasterType.disasterType !== DisasterTypeKey.drought) {
      return;
    }

    const seasonRegions = this.countryDisasterSettings?.droughtSeasonRegions;

    for (const seasonRegion of Object.keys(seasonRegions)) {
      if (event.eventName?.toLowerCase().includes(seasonRegion.toLowerCase())) {
        const leadTimeMonth = DateTime.fromISO(event.endDate).plus({
          months: Number(LeadTimeTriggerKey[event.firstLeadTime]),
        }).month;

        for (const season of Object.values(seasonRegions[seasonRegion])) {
          const seasonMonths = season.rainMonths;

          if (seasonMonths.includes(leadTimeMonth)) {
            const endMonth = seasonMonths[seasonMonths.length - 1];

            if (endMonth >= leadTimeMonth) {
              return endMonth - leadTimeMonth + 1;
            } else {
              return 12 - leadTimeMonth + endMonth + 1;
            }
          }
        }
      }
    }
  }

  private setAlertState = () => {
    const appElement = document.getElementById('app');

    if (appElement) {
      if (this.state.events?.length) {
        appElement.classList.remove('no-alert');
        appElement.classList.add('alert');
      } else {
        appElement.classList.remove('alert');
        appElement.classList.add('no-alert');
      }
    }
  };

  public getFirstLeadTimeDate(firstKey: LeadTime, timeUnit: LeadTimeUnit) {
    const timeUnitsInFuture = Number(LeadTimeTriggerKey[firstKey]);
    const futureDateTime =
      timeUnit === LeadTimeUnit.month
        ? this.today.plus({ months: Number(timeUnitsInFuture) })
        : timeUnit === LeadTimeUnit.day
          ? this.today.plus({ days: Number(timeUnitsInFuture) })
          : timeUnit === LeadTimeUnit.hour
            ? this.today.plus({ hours: Number(timeUnitsInFuture) })
            : null;

    if (timeUnit === LeadTimeUnit.month) {
      return futureDateTime.toFormat('LLLL yyyy');
    } else if (timeUnit === LeadTimeUnit.day) {
      return futureDateTime.toFormat('d LLLL yyyy');
    } else if (timeUnit === LeadTimeUnit.hour) {
      return futureDateTime.toFormat('cccc, dd LLLL HH:00');
    }
  }

  public isLastUploadDateLate = (
    lastUploadDate: Date,
    disasterType: DisasterType,
  ) => {
    const percentageOvertimeAllowed = 0.1; // 10%
    const durationUnit =
      disasterType.leadTimeUnit === LeadTimeUnit.day
        ? 'days'
        : disasterType.leadTimeUnit === LeadTimeUnit.hour
          ? 'hours'
          : disasterType.leadTimeUnit === LeadTimeUnit.month
            ? 'months'
            : null;
    const durationUnitValue =
      disasterType.leadTimeUnit === LeadTimeUnit.hour
        ? 6 // all "hour" pipelines are 6-hourly
        : 1; // in all other cases it is 1-daily/1-monthly;
    const nowDate = Date.now();
    const diff =
      durationUnit === 'hours'
        ? differenceInHours(nowDate, lastUploadDate)
        : durationUnit === 'days'
          ? differenceInDays(nowDate, lastUploadDate)
          : durationUnit === 'months'
            ? differenceInMonths(nowDate, lastUploadDate)
            : null;

    return diff > durationUnitValue + percentageOvertimeAllowed;
  };
}
