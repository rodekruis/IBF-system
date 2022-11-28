import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import {
  LeadTime,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { Country, DisasterType } from '../models/country.model';
import { DisasterTypeKey } from '../types/disaster-type-key';
import { EventState } from '../types/event-state';
import { DisasterTypeService } from './disaster-type.service';

export class EventSummary {
  countryCodeISO3: string;
  startDate: string;
  endDate: string;
  thresholdReached: boolean;
  activeTrigger: boolean;
  eventName: string;
  firstLeadTime?: string;
  firstLeadTimeLabel?: string;
  firstLeadTimeDate?: string;
  timeUnit?: string;
  typhoonLandfall?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private country: Country;
  private disasterType: DisasterType;

  private nullState = {
    events: null,
    event: null,
    activeEvent: null,
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
    this.getTrigger();
  };

  public switchEvent(eventName: string) {
    const event = this.state.activeTrigger
      ? this.state.events.find((e) => e.eventName === eventName)
      : this.state.event;
    // Trigger a different 'event' subject in this case ..
    // .. so that timelineService can distinguish between initial event switch and manual event switch
    this.setEventManually(event);
  }

  public setEventInitially(event: EventSummary) {
    this.state.event = event;
    this.initialEventStateSubject.next(this.state);
    this.setAlertState();
  }

  public setEventManually(event: EventSummary) {
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
  }

  public getTrigger() {
    if (this.country && this.disasterType) {
      this.apiService
        .getEventsSummary(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onEvent);
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

  private onEvent = (events) => {
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
          event.endDate = this.endDateToLastTriggerDate(event.endDate);
        }
        this.getFirstTriggerDate(event);
      }
    }

    this.state.activeEvent = !!events[0];
    this.state.activeTrigger =
      events[0] &&
      this.state.events.filter((e: EventSummary) => e.activeTrigger).length > 0;
    this.state.thresholdReached = events[0];
    this.setEventInitially(events[0]);

    this.setAlertState();
  };

  private endDateToLastTriggerDate(endDate: string): string {
    const originalEndDate = DateTime.fromFormat(endDate, 'yyyy-LL-dd');
    return originalEndDate.minus({ days: 7 }).toFormat('cccc, dd LLLL');
  }

  private setAlertState = () => {
    const dashboardElement = document.getElementById('ibf-dashboard-interface');
    if (dashboardElement) {
      if (
        this.state.event?.activeTrigger &&
        this.state.event?.thresholdReached
      ) {
        dashboardElement.classList.remove('no-alert');
        dashboardElement.classList.add('trigger-alert');
      } else {
        dashboardElement.classList.remove('trigger-alert');
        dashboardElement.classList.add('no-alert');
      }
    }
  };

  private getFirstTriggerDate(event) {
    if (this.country && this.disasterType) {
      this.apiService
        .getTriggerPerLeadTime(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          event.eventName,
        )
        .subscribe((response) =>
          this.onTriggerPerLeadTime(response, event.eventName),
        );
    }
  }

  private onTriggerPerLeadTime = (timesteps, eventName) => {
    let firstKey = null;
    if (timesteps) {
      Object.keys(timesteps)
        .filter((key) => Object.values(LeadTime).includes(key as LeadTime))
        .sort((a, b) =>
          Number(LeadTimeTriggerKey[a]) > Number(LeadTimeTriggerKey[b])
            ? 1
            : -1,
        )
        .forEach((key) => {
          if (timesteps[key] === '1') {
            firstKey = !firstKey ? key : firstKey;
          }
        });
    }

    const event =
      this.state.events.find((e) => e.eventName === eventName) ||
      this.state.events[0];

    event.firstLeadTime = firstKey;
    event.firstLeadTimeLabel = LeadTimeTriggerKey[firstKey];
    event.timeUnit = firstKey?.split('-')[1];

    event.firstLeadTimeDate = firstKey
      ? this.getFirstLeadTimeDate(firstKey, event.timeUnit)
      : null;

    if (this.disasterType.disasterType === DisasterTypeKey.typhoon) {
      this.getTyphoonLandfallState(event);
    }
  };

  private getTyphoonLandfallState(event: EventSummary) {
    this.apiService
      .getTyphoonTrack(
        this.country.countryCodeISO3,
        event.firstLeadTime as LeadTime,
        event.eventName,
      )
      .subscribe((trackpoints) => {
        event.typhoonLandfall =
          trackpoints.features.filter((point) => point.properties.firstLandfall)
            .length > 0;
      });
  }

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

  public isOldEvent = () => this.state.activeEvent && !this.state.activeTrigger;
}
