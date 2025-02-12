import { Injectable } from '@angular/core';
import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
} from 'date-fns';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import {
  LeadTime,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { RecentDate } from 'src/app/types/recent-date';

export class EventSummary {
  countryCodeISO3: string;
  startDate: string;
  endDate: string;
  forecastTrigger: boolean;
  eventName: string;
  firstLeadTime?: LeadTime;
  firstLeadTimeLabel?: string;
  firstLeadTimeDate?: string;
  firstTriggerLeadTime?: string;
  firstTriggerLeadTimeDate?: string;
  timeUnit?: string;
  duration?: number;
  disasterSpecificProperties: DisasterSpecificProperties;
  header?: string;
  nrAlertAreas?: number;
  mainExposureValueSum?: number;
}

export class DisasterSpecificProperties {
  typhoonLandfall?: boolean;
  typhoonNoLandfallYet?: boolean;
  eapAlertClass?: {
    key: string;
    value: string;
    color: string;
    textColor?: string;
    label?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private country: Country;
  private disasterType: DisasterType;
  private countryDisasterSettings: CountryDisasterSettings;

  public nullState: EventState = {
    events: null,
    event: null,
    forecastTrigger: null,
  };

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

  private setEventInitially(event: EventSummary) {
    this.state.event = event;
    this.state.forecastTrigger = this.setOverallForecasTrigger();
    this.initialEventStateSubject.next(this.state);
    this.setAlertState();
  }

  private setEventManually(event: EventSummary) {
    this.state.event = event;
    this.state.forecastTrigger = this.setOverallForecasTrigger();
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
        .getEventsSummary(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
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
        .getEventsSummary(countryCountryISO3, disasterType.disasterType)
        .subscribe(this.onGetDisasterTypeEvent(disasterType, callback));
    }
  }

  private onGetDisasterTypeEvent =
    (
      disasterType: DisasterType,
      callback: (disasterType: DisasterType) => void,
    ) =>
    (events: EventSummary[]) => {
      disasterType.activeTrigger =
        events.filter((e: EventSummary) => e.forecastTrigger).length > 0 ||
        false;
      callback(disasterType);
    };

  private onEvents = (events: EventSummary[]) => {
    this.apiService
      .getRecentDates(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
      )
      .subscribe((date) => {
        this.onRecentDates(date, events);
      });
  };

  private onRecentDates = (date: RecentDate, events: EventSummary[]) => {
    if (date.timestamp || date.date) {
      this.today = DateTime.fromISO(date.timestamp || date.date);
    } else {
      this.today = DateTime.now();
    }

    this.state.events = events;

    if (events.length) {
      for (const event of this.state.events) {
        event.startDate = DateTime.fromISO(event.startDate).toFormat(
          'cccc, dd LLLL',
        );
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
              event.firstTriggerLeadTime as LeadTime,
              event.timeUnit as LeadTimeUnit,
            )
          : null;

        event.duration = this.getEventDuration(event);
      }
    }

    this.sortEvents();

    if (events.length === 1) {
      this.setEventInitially(events[0]);
    } else if (this.skipNationalView(this.disasterType.disasterType)) {
      const triggerEvents = events.filter((e) => e.forecastTrigger);
      const eventToLoad = triggerEvents.length ? triggerEvents[0] : events[0];
      this.setEventInitially(eventToLoad);
    } else {
      this.setEventInitially(null);
    }

    this.setAlertState();
  };

  public skipNationalView(disastertype: DisasterTypeKey) {
    return (
      disastertype === DisasterTypeKey.typhoon ||
      disastertype === DisasterTypeKey.malaria
    );
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
          if (a.startDate > b.startDate) {
            return 1;
          } else if (a.startDate === b.startDate) {
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

  private getEventDuration(event: EventSummary) {
    if (this.disasterType.disasterType !== DisasterTypeKey.drought) {
      return;
    }
    const seasonRegions = this.countryDisasterSettings?.droughtSeasonRegions;
    for (const seasonRegion of Object.keys(seasonRegions)) {
      if (event.eventName?.toLowerCase().includes(seasonRegion.toLowerCase())) {
        const leadTimeMonth = DateTime.fromFormat(
          event.endDate,
          'yyyy-LL-dd',
        ).plus({
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
    const dashboardElement = document.getElementById('ibf-dashboard-interface');
    if (dashboardElement) {
      if (this.state.forecastTrigger) {
        dashboardElement.classList.remove('no-alert');
        dashboardElement.classList.add('trigger-alert');
      } else {
        dashboardElement.classList.remove('trigger-alert');
        dashboardElement.classList.add('no-alert');
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

  private setOverallForecasTrigger() {
    return this.state.event
      ? this.state.event.forecastTrigger
      : this.state.events?.filter((e: EventSummary) => e.forecastTrigger)
          .length > 0;
  }

  public isLastModelDateStale = (
    recentDate: Date,
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
        ? differenceInHours(nowDate, recentDate)
        : durationUnit === 'days'
          ? differenceInDays(nowDate, recentDate)
          : durationUnit === 'months'
            ? differenceInMonths(nowDate, recentDate)
            : null;

    return diff > durationUnitValue + percentageOvertimeAllowed;
  };
}
