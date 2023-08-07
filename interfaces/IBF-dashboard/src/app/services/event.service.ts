import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { LeadTimeTriggerKey, LeadTimeUnit } from 'src/app/types/lead-time';
import { Country, DisasterType } from '../models/country.model';
import { DisasterTypeKey } from '../types/disaster-type-key';
import { EventState } from '../types/event-state';
import { DisasterTypeService } from './disaster-type.service';

export class EventSummary {
  countryCodeISO3: string;
  startDate: string;
  endDate: string;
  endDateLabel: string;
  thresholdReached: boolean;
  activeTrigger: boolean;
  eventName: string;
  firstLeadTime?: string;
  firstLeadTimeLabel?: string;
  firstLeadTimeDate?: string;
  timeUnit?: string;
  duration?: number;
  disasterSpecificProperties: DisasterSpecificProperties;
}

export class DisasterSpecificProperties {
  typhoonLandfall?: boolean;
  typhoonNoLandfallYet?: boolean;
  flashFloodOngoing?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private country: Country;
  private disasterType: DisasterType;

  public nullState = {
    events: null,
    event: null,
    thresholdReached: null,
    activeTrigger: null,
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
    this.getEvents();
  };

  public switchEvent(eventName: string) {
    const event = this.state.activeTrigger
      ? this.state.events.find((e) => e.eventName === eventName)
      : this.state.event;
    // Trigger a different 'event' subject in this case ..
    // .. so that timelineService can distinguish between initial event switch and manual event switch
    this.setEventManually(event);
  }

  public resetEvents() {
    this.setEventInitially(null);
  }

  private setEventInitially(event: EventSummary) {
    this.state.event = event;
    this.state.activeTrigger = this.setOverallActiveTrigger();
    this.state.thresholdReached = this.setOverallThresholdReached();
    this.initialEventStateSubject.next(this.state);
    this.setAlertState();
  }

  private setEventManually(event: EventSummary) {
    this.state.event = event;
    this.state.activeTrigger = this.setOverallActiveTrigger();
    this.state.thresholdReached = this.setOverallThresholdReached();
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
    country: string,
    disasterType: DisasterType,
    callback,
  ) {
    if (country && disasterType) {
      this.apiService
        .getEventsSummary(country, disasterType.disasterType)
        .subscribe(this.onGetDisasterTypeEvent(disasterType, callback));
    }
  }

  private onGetDisasterTypeEvent = (disasterType: DisasterType, callback) => (
    events,
  ) => {
    disasterType.activeTrigger =
      events.filter((e: EventSummary) => e.activeTrigger && e.thresholdReached)
        .length > 0 || false;
    callback(disasterType);
  };

  private onEvents = (events) => {
    this.apiService
      .getRecentDates(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
      )
      .subscribe((date) => this.onRecentDates(date, events));
  };

  private onRecentDates = (date, events) => {
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
        if (event.endDate) {
          event.endDate = DateTime.fromFormat(event.endDate, 'yyyy-LL-dd')
            .minus({ days: 7 })
            .toFormat('yyyy-LL-dd');
          event.endDateLabel = DateTime.fromFormat(
            event.endDate,
            'yyyy-LL-dd',
          ).toFormat('cccc, dd LLLL');
        }
        event.firstLeadTimeLabel = LeadTimeTriggerKey[event.firstLeadTime];
        event.timeUnit = event.firstLeadTime?.split('-')[1];

        event.firstLeadTimeDate = event.firstLeadTime
          ? this.getFirstLeadTimeDate(event.firstLeadTime, event.timeUnit)
          : null;

        event.duration = this.getEventDuration(event);
      }
    }

    this.sortEvents();

    if (events.length === 1) {
      this.setEventInitially(events[0]);
    } else if (this.disasterType.disasterType === DisasterTypeKey.typhoon) {
      // exception: make typhoon still load 1st event by default
      const triggerEvents = events.filter((e) => e.thresholdReached);
      const eventToLoad = triggerEvents ? triggerEvents[0] : events[0];
      this.setEventInitially(eventToLoad);
    } else {
      this.setEventInitially(null);
    }

    this.setAlertState();
  };

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
    const seasons = this.country.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
    ).droughtForecastSeasons;
    for (const seasonRegion of Object.keys(seasons)) {
      if (event.eventName?.toLowerCase().includes(seasonRegion.toLowerCase())) {
        const leadTimeMonth = DateTime.fromFormat(
          event.endDate,
          'yyyy-LL-dd',
        ).plus({
          months: Number(LeadTimeTriggerKey[event.firstLeadTime]),
        }).month;
        for (const season of Object.values(seasons[seasonRegion])) {
          const rainMonthsKey = 'rainMonths';
          const seasonMonths = season[rainMonthsKey];
          if (seasonMonths.includes(leadTimeMonth)) {
            const endMonth = seasonMonths[seasonMonths.length - 1];
            const duration = endMonth - leadTimeMonth + 1;
            return duration;
          }
        }
      }
    }
  }

  private setAlertState = () => {
    const dashboardElement = document.getElementById('ibf-dashboard-interface');
    if (dashboardElement) {
      if (this.state.activeTrigger && this.state.thresholdReached) {
        dashboardElement.classList.remove('no-alert');
        dashboardElement.classList.add('trigger-alert');
      } else {
        dashboardElement.classList.remove('trigger-alert');
        dashboardElement.classList.add('no-alert');
      }
    }
  };

  public getFirstLeadTimeDate(firstKey, timeUnit: LeadTimeUnit) {
    const timeUnitsInFuture = Number(LeadTimeTriggerKey[firstKey]);
    const futureDateTime =
      timeUnit === LeadTimeUnit.month
        ? this.today.plus({ months: Number(timeUnitsInFuture) })
        : timeUnit === LeadTimeUnit.day
        ? this.today.plus({ days: Number(timeUnitsInFuture) })
        : timeUnit === LeadTimeUnit.hour
        ? this.today.plus({ hours: Number(timeUnitsInFuture) })
        : null;
    const monthString = new Date(
      futureDateTime.year,
      futureDateTime.month - 1,
      1,
    ).toLocaleString('default', { month: 'long' });

    if (timeUnit === LeadTimeUnit.month) {
      return `${monthString} ${futureDateTime.year}`;
    } else if (timeUnit === LeadTimeUnit.day) {
      return `${futureDateTime.day} ${monthString} ${futureDateTime.year}`;
    } else if (timeUnit === LeadTimeUnit.hour) {
      return futureDateTime.toFormat('cccc, dd LLLL HH:00');
    }
  }

  public isOldEvent = () => this.state.event && !this.state.activeTrigger;

  private setOverallActiveTrigger() {
    return this.state.event
      ? this.state.event.activeTrigger
      : this.state.events?.filter((e: EventSummary) => e.activeTrigger).length >
          0;
  }

  private setOverallThresholdReached() {
    return this.state.event
      ? this.state.event.thresholdReached
      : this.state.events?.filter((e: EventSummary) => e.thresholdReached)
          .length > 0;
  }
}
