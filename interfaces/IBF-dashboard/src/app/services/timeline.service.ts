import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import {
  LeadTime,
  LeadTimeButtonInput,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { CountryTriggers } from '../models/country-triggers.model';
import { Country, DisasterType } from '../models/country.model';
import { DisasterTypeKey } from '../types/disaster-type-key';
import { EventState } from '../types/event-state';
import { TimelineState } from '../types/timeline-state';
import { DisasterTypeService } from './disaster-type.service';
import { EventService } from './event.service';
import { PlaceCodeService } from './place-code.service';

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
  private triggersAllEvents: CountryTriggers;
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
    this.triggersAllEvents = null;
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
    const isLeadTimeEnabled = this.isLeadTimeEnabled(leadTime);
    const isUndefinedLeadTime = this.eventState.events
      .filter((e) => e.disasterSpecificProperties?.typhoonNoLandfallYet)
      .map((e) => e.firstLeadTime)
      .includes(leadTime);
    const triggerKey = LeadTimeTriggerKey[leadTime];
    this.state.timeStepButtons[index] = {
      date: this.getLeadTimeDate(leadTime, triggerKey, leadTimeInput.undefined),
      unit: leadTime.split('-')[1] as LeadTimeUnit,
      value: leadTime,
      alert:
        this.triggersAllEvents &&
        this.triggersAllEvents[leadTime] &&
        this.triggersAllEvents[leadTime] === '1' &&
        this.triggersAllEvents[`${leadTime}-thresholdReached`] === '1' &&
        (!isUndefinedLeadTime ||
          (isUndefinedLeadTime && leadTimeInput.undefined)),
      disabled: !isLeadTimeEnabled && !leadTimeInput.undefined,
      active: false,
      noEvent: this.isNoEvent(),
      eventName: leadTimeInput.eventName,
      duration: this.eventState.events.find(
        (e) => e.eventName === leadTimeInput.eventName,
      )?.duration,
    };
  };

  private isNoEvent() {
    return (
      this.eventState.events.length === 0 &&
      this.disasterType.disasterType === DisasterTypeKey.typhoon
    );
  }

  private onTriggerPerLeadTime = (triggers) => {
    this.triggersAllEvents = { ...this.triggersAllEvents, ...triggers };

    this.state.timeStepButtons = [];
    const visibleLeadTimes = this.getVisibleLeadTimes();
    visibleLeadTimes.map(this.leadTimeToLeadTimeButton);

    // filter enabled + triggered lead-times
    let toShowTimeStepButtons = this.state.timeStepButtons.filter(
      (timeStepButton) => !timeStepButton.disabled && timeStepButton.alert,
    );
    // except if that leads to empty set: filter enabled lead-times
    if (toShowTimeStepButtons.length === 0) {
      toShowTimeStepButtons = this.state.timeStepButtons.filter(
        (timeStepButton) => !timeStepButton.disabled,
      );
    }
    // and take first one of this set as active lead-time
    if (toShowTimeStepButtons.length > 0) {
      if (this.eventState.events?.length > 1 && !this.eventState.event) {
        this.handleTimeStepButtonClick(null, null);
      } else {
        this.handleTimeStepButtonClick(toShowTimeStepButtons[0].value);
      }
    } // except if that leads to still empty set: assume this is the typhoon no-event scenario
    else if (toShowTimeStepButtons.length === 0) {
      this.handleTimeStepButtonClick(LeadTime.hour72, null, true);
    }
  };

  private onRecentDates = (date) => {
    if (date.timestamp || date.date) {
      this.state.today = DateTime.fromISO(date.timestamp || date.date);
    } else {
      this.state.today = DateTime.now();
    }
    // SIMULATE: change this to simulate different months
    // const addMonthsToCurrentDate = -1;
    // this.state.today = this.state.today.plus({
    //   months: addMonthsToCurrentDate,
    // });

    const events = this.eventState?.events;
    if (events?.length) {
      for (const event of events) {
        if (event.activeTrigger) {
          this.apiService
            .getTriggerPerLeadTime(
              this.country.countryCodeISO3,
              this.disasterType.disasterType,
              event?.eventName,
            )
            .subscribe(this.onTriggerPerLeadTime);
        } else {
          this.onTriggerPerLeadTime(null);
        }
      }
    }
    if (!events || !events.length) {
      this.onTriggerPerLeadTime(null);
    }
  };

  public loadTimeStepButtons(): void {
    if (this.country && this.disasterType && this.eventState) {
      this.apiService
        .getRecentDates(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onRecentDates);
    }
  }

  private deactivateLeadTimeButton = (leadTimeButton) =>
    (leadTimeButton.active = false);

  public handleTimeStepButtonClick(
    timeStepButtonValue: LeadTime,
    eventName?: string,
    noEvent?: boolean,
  ) {
    this.placeCodeService.clearPlaceCode();
    this.placeCodeService.clearPlaceCodeHover();

    this.state.activeLeadTime = timeStepButtonValue;
    this.state.timeStepButtons.forEach(this.deactivateLeadTimeButton);
    const btnToActivate = this.state.timeStepButtons.find((btn) =>
      noEvent
        ? btn.value === timeStepButtonValue
        : eventName
        ? btn.value === timeStepButtonValue &&
          !btn.disabled &&
          btn.eventName === eventName
        : btn.value === timeStepButtonValue && !btn.disabled,
    );
    if (btnToActivate) {
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
      if (
        this.country.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        ).droughtEndOfMonthPipeline
      ) {
        return this.state.today.plus({ months: Number(triggerKey) + 1 });
      }
      return this.state.today.plus({ months: Number(triggerKey) });
    }
  }

  private isLeadTimeEnabled(leadTime: LeadTime): boolean {
    const leadTimes = this.country
      ? this.country.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        ).activeLeadTimes
      : [];
    const leadTimeIndex = leadTimes.indexOf(leadTime);

    const leadTimeAvailable =
      leadTimeIndex >= 0 &&
      this.filterActiveLeadTimePerDisasterType(this.disasterType, leadTime);

    return leadTimeAvailable;
  }

  private getVisibleLeadTimes() {
    const visibleLeadTimes: LeadTimeButtonInput[] = [];
    this.disasterType.leadTimes.sort((a, b) =>
      Number(LeadTimeTriggerKey[a.leadTimeName]) >
      Number(LeadTimeTriggerKey[b.leadTimeName])
        ? 1
        : -1,
    );
    for (const leadTime of this.disasterType.leadTimes) {
      // Push first only active lead-times ..
      if (
        visibleLeadTimes
          .map((lt) => lt.leadTime)
          .indexOf(leadTime.leadTimeName) === -1 &&
        this.isLeadTimeEnabled(leadTime.leadTimeName)
      ) {
        // add separate events with same lead-time, separately
        const filteredEvents = this.eventState.events.filter(
          (e) => e.firstLeadTime === leadTime.leadTimeName,
        );
        if (filteredEvents) {
          for (const event of filteredEvents.reverse()) {
            visibleLeadTimes.push({
              leadTime: leadTime.leadTimeName,
              eventName: event.eventName,
              undefined: false,
              duration: event.duration,
            });
          }
        }
      }
    }
    for (const leadTime of this.disasterType.leadTimes) {
      // .. and then all other lead-times
      if (
        visibleLeadTimes
          .map((lt) => lt.leadTime)
          .indexOf(leadTime.leadTimeName) === -1 &&
        this.showNonActiveLeadTimes(
          visibleLeadTimes.map((lt) => lt.leadTime),
          leadTime.leadTimeName,
        ) &&
        this.filterVisibleLeadTimePerDisasterType(
          this.disasterType,
          leadTime.leadTimeName,
          visibleLeadTimes,
        )
      ) {
        visibleLeadTimes.push({
          leadTime: leadTime.leadTimeName,
          eventName: null,
          undefined: false,
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
          leadTime: event.firstLeadTime as LeadTime,
          eventName: null,
          undefined: true,
        });
      }
    }

    return visibleLeadTimes;
  }

  private showNonActiveLeadTimes(leadTimes, leadTimeName) {
    // check if there are no other (hourly) leadtimes for the same day already
    return (
      !leadTimes
        .map((leadTime) => this.getDateFromLeadTime(leadTime))
        .includes(this.getDateFromLeadTime(leadTimeName)) ||
      this.isLeadTimeEnabled(leadTimeName)
    );
  }

  private getDateFromLeadTime(leadTime) {
    const date = this.getLeadTimeDate(
      leadTime,
      LeadTimeTriggerKey[leadTime],
      false,
    ).toISODate();

    return date;
  }

  private checkRegionalDroughtSeason() {
    const forecastSeasonAreas = this.country.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
    ).droughtForecastSeasons;
    return Object.values(forecastSeasonAreas).length > 1;
  }

  private filterVisibleLeadTimePerDisasterType(
    disasterType: DisasterType,
    leadTime: LeadTime,
    activeLeadTimes: LeadTimeButtonInput[],
  ): boolean {
    if (disasterType.disasterType === DisasterTypeKey.drought) {
      if (this.checkRegionalDroughtSeason()) {
        // hide months that are already covered in the duration of a preceding event/lead-time button
        for (const activeLeadTime of activeLeadTimes) {
          const startLeadTimeNumber = Number(
            LeadTimeTriggerKey[activeLeadTime.leadTime],
          );
          const endLeadTimeNumber =
            startLeadTimeNumber + activeLeadTime.duration;
          if (
            Number(LeadTimeTriggerKey[leadTime]) <= endLeadTimeNumber &&
            Number(LeadTimeTriggerKey[leadTime]) >= startLeadTimeNumber
          ) {
            return false;
          }
        }
        return true;
      }
      const leadTimeMonth = this.getLeadTimeMonth(leadTime);
      const nextForecastMonthEndOfMonth = this.getNextForecastMonth();
      return (
        leadTimeMonth <= nextForecastMonthEndOfMonth // hide months beyond next Forecast month
      );
    } else if (disasterType.disasterType === DisasterTypeKey.typhoon) {
      return [
        LeadTime.hour0,
        LeadTime.hour24,
        LeadTime.hour48,
        LeadTime.hour72,
        LeadTime.hour96,
        LeadTime.hour120,
        LeadTime.hour144,
        LeadTime.hour168,
      ].includes(leadTime);
    } else {
      return true;
    }
  }

  private filterActiveLeadTimePerDisasterType(
    disasterType: DisasterType,
    leadTime: LeadTime,
  ): boolean {
    if (disasterType.disasterType === DisasterTypeKey.drought) {
      const leadTimeMonth = this.getLeadTimeMonth(leadTime);
      if (this.checkRegionalDroughtSeason()) {
        // If regional drought seasons (and thus potentially multiple triggers) ..
        const triggeredLeadTimes = Object.keys(this.triggersAllEvents).filter(
          (lt) => this.triggersAllEvents[lt] === '1',
        );
        // .. show all triggered lead times only
        if (triggeredLeadTimes.length) {
          return triggeredLeadTimes.includes(leadTime);
        }
        // .. otherwise determine first available leadtime month
        const nextForecastMonth = this.getNextForecastMonth();
        return nextForecastMonth.equals(leadTimeMonth);
      } else {
        // .. otherwise determine first available leadtime month
        const nextForecastMonth = this.getNextForecastMonth();
        return nextForecastMonth.equals(leadTimeMonth);
      }
    } else if (disasterType.disasterType === DisasterTypeKey.typhoon) {
      const events = this.eventState?.events;
      const relevantLeadTimes = this.eventState?.activeTrigger
        ? events
            .filter((e) => !e.disasterSpecificProperties?.typhoonNoLandfallYet)
            .map((e) => e.firstLeadTime)
        : [];
      return relevantLeadTimes.includes(leadTime);
    } else {
      return true;
    }
  }

  private shiftYear = (monthNumber: number) => {
    // Make sure you start counting the year at the beginning of (one of the) seasons, instead of at January
    // so that 'month > currentMonth' does not break on a season like [12,1,2]
    const seasonRegions = this.country.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
    ).droughtForecastSeasons;
    let seasonBeginnings = [];
    for (const region of Object.values(seasonRegions)) {
      seasonBeginnings.push(
        Object.values(region)
          .map((season) => season.rainMonths)
          .map((month) => month[0]),
      );
    }
    seasonBeginnings = seasonBeginnings.map((s) => s[0]);
    return (monthNumber + 12 - seasonBeginnings[0]) % 12;
  };

  private getNextForecastMonth(): DateTime {
    let todayLeadTime = this.state.today;
    if (
      this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).droughtEndOfMonthPipeline
    ) {
      todayLeadTime = this.state.today.plus({ month: 1 });
    }
    const currentYear = todayLeadTime.year;
    const currentMonth = todayLeadTime.month;

    let forecastMonthNumbers = [];
    for (const season of this.getRainMonths()) {
      let filteredSeason;
      if (season.includes(currentMonth)) {
        filteredSeason = season.filter((month) => {
          const shiftedMonth = this.shiftYear(month);
          const shiftedCurrentMonth = this.shiftYear(currentMonth);
          return shiftedMonth >= shiftedCurrentMonth;
        });
      } else {
        filteredSeason = season;
      }
      forecastMonthNumbers = [...forecastMonthNumbers, ...filteredSeason];
    }

    let forecastMonthNumber: number;
    forecastMonthNumbers
      .sort((a, b) => (a > b ? -1 : 1))
      .forEach((month) => {
        if (currentMonth <= month) {
          forecastMonthNumber = month;
        }
      });
    if (!forecastMonthNumber) {
      forecastMonthNumber =
        forecastMonthNumbers[forecastMonthNumbers.length - 1];
    }
    const nextForecastMonthYear =
      currentMonth > forecastMonthNumber ? currentYear + 1 : currentYear;
    return DateTime.utc(nextForecastMonthYear, forecastMonthNumber, 1);
  }

  private getLeadTimeMonth(leadTime: LeadTime): DateTime {
    const addMonths =
      Number(LeadTimeTriggerKey[leadTime]) +
      (this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).droughtEndOfMonthPipeline
        ? 1
        : 0);
    const leadTimeMonth = this.state.today.plus({
      month: addMonths,
    });
    return DateTime.utc(leadTimeMonth.year, leadTimeMonth.month, 1);
  }

  private getRainMonths = (): number[][] => {
    const rainMonthsKey = 'rainMonths';
    const rainMonths = [];
    for (const area of Object.values(
      this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).droughtForecastSeasons,
    )) {
      for (const season of Object.values(area)) {
        rainMonths.push(season[rainMonthsKey]);
      }
    }

    return rainMonths;
  };
}
