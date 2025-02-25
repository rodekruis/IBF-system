/* eslint-disable perfectionist/sort-array-includes */
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertPerLeadTime } from 'src/app/models/alert-per-lead-time.model';
import { Country, DisasterType } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import { LastUploadDate } from 'src/app/types/last-upload-date';
import {
  LeadTime,
  LeadTimeButtonInput,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { TimelineState, TimeStepButton } from 'src/app/types/timeline-state';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  private startingState: TimelineState = {
    today: DateTime.now(),
    timeStepButtons: [],
    activeLeadTime: null,
  };
  public state = this.startingState;
  private timelineStateSubject = new BehaviorSubject<TimelineState>(
    this.startingState,
  );
  private alertsAllEvents: AlertPerLeadTime;
  private country: Country;
  private disasterType: DisasterType;
  private eventState: EventState;

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private eventService: EventService,
    private apiService: ApiService,
    private placeCodeService: PlaceCodeService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onInitialEventStateChange);

    this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onManualEventStateChange);
  }

  private onCountryChange = (country: Country) => {
    this.resetState();
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.resetState();
    this.disasterType = disasterType;
  };

  private resetState() {
    this.alertsAllEvents = null;
    this.eventState = this.eventService.nullState;
    this.state = this.startingState;
  }

  private onInitialEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
    if (this.country && this.disasterType && this.eventState) {
      this.loadTimeStepButtons();
    }
  };

  private onManualEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  public getTimelineStateSubscription(): Observable<TimelineState> {
    return this.timelineStateSubject.asObservable();
  }

  private leadTimeToLeadTimeButton = (
    leadTimeInput: LeadTimeButtonInput,
    index: number,
  ): void => {
    const leadTime = leadTimeInput.leadTime;
    const isUndefinedLeadTime = this.eventState.events
      .filter((e) => e.disasterSpecificProperties?.typhoonNoLandfallYet)
      .map((e) => e.firstLeadTime)
      .includes(leadTime);
    const triggerKey = LeadTimeTriggerKey[leadTime];
    const forecastAlert =
      (this.alertsAllEvents?.[leadTime] === '1' ||
        leadTimeInput.forecastAlert) &&
      (!isUndefinedLeadTime ||
        (isUndefinedLeadTime && leadTimeInput.undefinedLeadTime));

    this.state.timeStepButtons[index] = {
      date: this.getLeadTimeDate(
        leadTime,
        triggerKey,
        leadTimeInput.undefinedLeadTime,
      ),
      unit: leadTime.split('-')[1] as LeadTimeUnit,
      value: leadTime,
      forecastAlert,
      forecastTrigger:
        forecastAlert &&
        (leadTimeInput.forecastTrigger ||
          this.alertsAllEvents[`${leadTime}-forecastTrigger`] === '1'),
      active: false,
      eventNames: leadTimeInput.eventNames,
    };
  };

  private onAlertPerLeadTime = (alertsPerLeadTime: AlertPerLeadTime) => {
    this.alertsAllEvents = alertsPerLeadTime;

    this.state.timeStepButtons = [];
    const visibleLeadTimes = this.getVisibleLeadTimes();
    visibleLeadTimes.map(this.leadTimeToLeadTimeButton);

    this.setTimelineState(
      this.eventState.event
        ? this.eventState.event.firstTriggerLeadTime ||
            this.eventState.event.firstLeadTime
        : this.eventState.events?.length > 0
          ? null
          : this.getFallbackNoTriggerLeadTime(this.disasterType.disasterType),
      this.eventState.event ? this.eventState.event.eventName : null,
    );
  };

  private getFallbackNoTriggerLeadTime(disasterType: DisasterTypeKey) {
    if (disasterType === DisasterTypeKey.floods) {
      return LeadTime.day1;
    } else if (disasterType === DisasterTypeKey.flashFloods) {
      return LeadTime.hour1;
    } else {
      return null;
    }
  }

  private onLastUploadDate = (lastUploadDate: LastUploadDate) => {
    if (lastUploadDate.timestamp || lastUploadDate.date) {
      this.state.today = DateTime.fromISO(
        lastUploadDate.timestamp || lastUploadDate.date,
      );
    } else {
      this.state.today = DateTime.now();
    }
    // SIMULATE: change this to simulate different months
    // const addMonthsToCurrentDate = -1;
    // this.state.today = this.state.today.plus({
    //   months: addMonthsToCurrentDate,
    // });

    // First get triggers per day across all events for timeline
    this.apiService
      .getAlertPerLeadTime(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
        null,
      )
      .subscribe(this.onAlertPerLeadTime);
  };

  public loadTimeStepButtons(): void {
    if (this.country && this.disasterType && this.eventState) {
      this.apiService
        .getLastUploadDate(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onLastUploadDate);
    }
  }

  private deactivateLeadTimeButton = (leadTimeButton: TimeStepButton) =>
    (leadTimeButton.active = false);

  public setTimelineState(timeStepButtonValue: LeadTime, eventName: string) {
    this.placeCodeService.clearPlaceCode();
    this.placeCodeService.clearPlaceCodeHover();

    this.state.activeLeadTime = timeStepButtonValue;
    this.state.timeStepButtons.forEach(this.deactivateLeadTimeButton);
    const btnsToActivate = this.state.timeStepButtons.filter(
      (btn) => btn.eventNames.includes(eventName) && btn.forecastAlert,
    );
    for (const btnToActivate of btnsToActivate) {
      btnToActivate.active = true;
    }

    this.timelineStateSubject.next(this.state);
  }

  private getLeadTimeDate(
    leadTime: LeadTime,
    triggerKey: string,
    leadTimeUndefined: boolean,
  ) {
    if (leadTimeUndefined) {
      return;
    }
    if (leadTime.includes(LeadTimeUnit.day)) {
      return this.state.today.plus({ days: Number(triggerKey) });
    } else if (leadTime.includes(LeadTimeUnit.hour)) {
      return this.state.today.plus({ hours: Number(triggerKey) });
    } else if (leadTime.includes(LeadTimeUnit.month)) {
      return this.state.today.plus({ months: Number(triggerKey) });
    }
  }

  private getVisibleLeadTimes() {
    const visibleLeadTimes: LeadTimeButtonInput[] = [];
    const disasterLeadTimes: LeadTime[] = [];
    let disasterLeadTime = this.disasterType.minLeadTime;
    const maxLeadTime = Number(this.disasterType.maxLeadTime.split('-')[0]);
    while (Number(disasterLeadTime.split('-')[0]) <= maxLeadTime) {
      disasterLeadTimes.push(disasterLeadTime);
      disasterLeadTime = disasterLeadTime.replace(
        disasterLeadTime.split('-')[0],
        String(Number(disasterLeadTime.split('-')[0]) + 1),
      ) as LeadTime;
    }

    for (const event of this.eventState.events) {
      // Push first event starting lead-times ..
      const duration = event.duration || 1;
      for (let i = 0; i < duration; i++) {
        // .. for events with duration (drought) also push the following lead-times
        const leadTime =
          `${String(Number(event.firstLeadTime.split('-')[0]) + i)}-${
            event.firstLeadTime.split('-')[1]
          }` as LeadTime;
        if (!visibleLeadTimes.map((lt) => lt.leadTime).includes(leadTime)) {
          visibleLeadTimes.push({
            leadTime,
            eventNames: [event.eventName],
            forecastAlert: true,
            forecastTrigger: event.forecastTrigger,
            undefinedLeadTime: false,
          });
        } else {
          const leadTimeButton = visibleLeadTimes.find(
            (lt) => lt.leadTime === leadTime,
          );
          leadTimeButton.eventNames.push(event.eventName);
          leadTimeButton.forecastTrigger =
            leadTimeButton.forecastTrigger || event.forecastTrigger;
        }
      }
    }

    for (const leadTime of disasterLeadTimes) {
      // .. and then all other lead-times
      if (
        // don't add the same lead time twice
        !visibleLeadTimes.map((lt) => lt.leadTime).includes(leadTime) &&
        // and decide for others to show or not
        this.filterVisibleLeadTimePerDisasterType(
          this.disasterType,
          leadTime,
          visibleLeadTimes,
        )
      ) {
        visibleLeadTimes.push({
          leadTime,
          eventNames: [],
          forecastAlert: false,
          forecastTrigger: false,
          undefinedLeadTime: false,
        });
      }
    }

    visibleLeadTimes.sort((a, b) =>
      Number(LeadTimeTriggerKey[a.leadTime]) >
      Number(LeadTimeTriggerKey[b.leadTime])
        ? 1
        : -1,
    );

    // Separately add at the end leadtimes that should be conveyed as 'undefined'
    const undefinedLeadTimeEvents = this.eventState?.events.filter(
      (e) => e.disasterSpecificProperties?.typhoonNoLandfallYet,
    );
    if (undefinedLeadTimeEvents) {
      for (const event of undefinedLeadTimeEvents) {
        visibleLeadTimes.push({
          leadTime: event.firstLeadTime,
          eventNames: [event.eventName],
          forecastAlert: true,
          forecastTrigger: event.forecastTrigger,
          undefinedLeadTime: true,
        });
      }
    }

    return visibleLeadTimes;
  }

  private getDateFromLeadTime(leadTime: LeadTime) {
    const date = this.getLeadTimeDate(
      leadTime,
      LeadTimeTriggerKey[leadTime],
      false,
    ).toISODate();

    return date;
  }

  private filterVisibleLeadTimePerDisasterType(
    disasterType: DisasterType,
    leadTime: LeadTime,
    activeLeadTimes: LeadTimeButtonInput[],
  ): boolean {
    if (disasterType.disasterType === DisasterTypeKey.typhoon) {
      // show 1 button per day ..
      return (
        [
          LeadTime.hour0,
          LeadTime.hour24,
          LeadTime.hour48,
          LeadTime.hour72,
          LeadTime.hour96,
          LeadTime.hour120,
          LeadTime.hour144,
          LeadTime.hour168,
        ].includes(leadTime) &&
        // .. except if already one present for that day
        !activeLeadTimes
          .map((lt) => this.getDateFromLeadTime(lt.leadTime))
          .includes(this.getDateFromLeadTime(leadTime))
      );
    } else if (disasterType.disasterType === DisasterTypeKey.flashFloods) {
      // show 1 button per day ..
      return (
        [LeadTime.hour0, LeadTime.hour24, LeadTime.hour48].includes(leadTime) &&
        // .. except if already one present for that day
        !activeLeadTimes
          .map((lt) => this.getDateFromLeadTime(lt.leadTime))
          .includes(this.getDateFromLeadTime(leadTime))
      );
    } else {
      return true;
    }
  }
}
