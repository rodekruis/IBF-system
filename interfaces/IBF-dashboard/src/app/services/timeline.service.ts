import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertPerLeadTime } from 'src/app/models/alert-per-lead-time.model';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import {
  LeadTime,
  LeadTimeButtonInput,
  LeadTimeTriggerKey,
  LeadTimeUnit,
} from 'src/app/types/lead-time';
import { RecentDate } from 'src/app/types/recent-date';
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
  private countryDisasterSettings: CountryDisasterSettings;
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
    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );
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

  private hasDisabledTimeline(disasterType: DisasterTypeKey) {
    return [DisasterTypeKey.flashFloods, DisasterTypeKey.floods].includes(
      disasterType,
    );
  }

  private leadTimeToLeadTimeButton = (
    leadTimeInput: LeadTimeButtonInput,
    index: number,
  ): void => {
    const leadTime = leadTimeInput.leadTime;
    const isLeadTimeEnabled =
      this.isLeadTimeEnabled(leadTime) &&
      !this.hasDisabledTimeline(this.disasterType.disasterType);
    const isUndefinedLeadTime = this.eventState.events
      .filter((e) => e.disasterSpecificProperties?.typhoonNoLandfallYet)
      .map((e) => e.firstLeadTime)
      .includes(leadTime);
    const triggerKey = LeadTimeTriggerKey[leadTime];
    const forecastAlert =
      this.alertsAllEvents?.[leadTime] === '1' &&
      (!isUndefinedLeadTime ||
        (isUndefinedLeadTime && leadTimeInput.undefined));

    this.state.timeStepButtons[index] = {
      date: this.getLeadTimeDate(leadTime, triggerKey, leadTimeInput.undefined),
      unit: leadTime.split('-')[1] as LeadTimeUnit,
      value: leadTime,
      forecastAlert,
      forecastTrigger:
        forecastAlert &&
        this.alertsAllEvents[`${leadTime}-forecastTrigger`] === '1',
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

  private onAlertPerLeadTime = (alertsPerLeadTime: AlertPerLeadTime) => {
    this.alertsAllEvents = alertsPerLeadTime;

    this.state.timeStepButtons = [];
    const visibleLeadTimes = this.getVisibleLeadTimes();
    visibleLeadTimes.map(this.leadTimeToLeadTimeButton);

    // filter enabled + alerted lead-times
    let toShowTimeStepButtons = this.state.timeStepButtons.filter(
      (timeStepButton) =>
        !timeStepButton.disabled && timeStepButton.forecastAlert,
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
    } // except if that leads to still empty set:
    else if (toShowTimeStepButtons.length === 0) {
      // assume this is the typhoon no-event scenario
      if (this.disasterType.disasterType === DisasterTypeKey.typhoon) {
        this.handleTimeStepButtonClick(LeadTime.hour72, null, true);
      } else if (
        // or the floods/flash-floods scenario where all buttons are disabled
        this.hasDisabledTimeline(this.disasterType.disasterType)
      ) {
        this.handleTimeStepButtonClick(
          this.eventState.event
            ? ((this.eventState.event.firstTriggerLeadTime ||
                this.eventState.event.firstLeadTime) as LeadTime)
            : this.eventState.events?.length > 0
              ? null
              : this.getFallbackNoTriggerLeadTime(
                  this.disasterType.disasterType,
                ),
          null,
        );
      }
    }
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

  private onRecentDates = (date: RecentDate) => {
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
        .getRecentDates(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onRecentDates);
    }
  }

  private deactivateLeadTimeButton = (leadTimeButton: TimeStepButton) =>
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
    const btnToActivate = this.state.timeStepButtons.find(
      (btn) =>
        noEvent
          ? btn.value === timeStepButtonValue
          : eventName &&
              !this.hasDisabledTimeline(this.disasterType.disasterType)
            ? btn.value === timeStepButtonValue &&
              !btn.disabled &&
              btn.eventName === eventName // if interactive timeline: also match on eventName (if available)
            : btn.value === timeStepButtonValue, // if non-interactive timeline: only match on leadTime & also highlight disabled buttons
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
      return this.state.today.plus({ months: Number(triggerKey) });
    }
  }

  private isLeadTimeEnabled(
    leadTime: LeadTime,
    previouslyAddedLeadTimes?: LeadTimeButtonInput[],
  ): boolean {
    // Get all possible leadTimes for this country and disaster-type
    const leadTimes = this.country
      ? this.countryDisasterSettings.activeLeadTimes
      : [];
    const leadTimeIndex = leadTimes.indexOf(leadTime);

    // for flash-floods keep only 1 lead-time per day
    if (
      previouslyAddedLeadTimes
        ?.map((lt) => this.getDateFromLeadTime(lt.leadTime))
        .includes(this.getDateFromLeadTime(leadTime)) &&
      this.disasterType.disasterType === DisasterTypeKey.flashFloods
    ) {
      return false;
    }

    // Apply additional disaster-type-specific filtering
    const leadTimeAvailable =
      leadTimeIndex >= 0 &&
      this.filterActiveLeadTimePerDisasterType(this.disasterType, leadTime);

    return leadTimeAvailable;
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

    for (const leadTime of disasterLeadTimes) {
      // Push first only active lead-times ..
      if (
        !visibleLeadTimes.map((lt) => lt.leadTime).includes(leadTime) &&
        this.isLeadTimeEnabled(leadTime, visibleLeadTimes)
      ) {
        if (this.hasDisabledTimeline(this.disasterType.disasterType)) {
          // for non-interactive timeline: add lead-time only once
          visibleLeadTimes.push({
            leadTime,
            eventName: null,
            undefined: false,
          });
        } else {
          // for interactive timeline: add separate events with same lead-time separately
          const filteredEvents = this.eventState.events.filter(
            (e) => e.firstLeadTime === leadTime,
          );
          if (filteredEvents) {
            for (const event of filteredEvents.reverse()) {
              visibleLeadTimes.push({
                leadTime,
                eventName: event.eventName,
                undefined: false,
                duration: event.duration,
              });
            }
          }
        }
      }
    }
    for (const leadTime of disasterLeadTimes) {
      // .. and then all other lead-times
      if (
        // skip already added leadTimes
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
          leadTime: event.firstLeadTime,
          eventName: event.eventName,
          undefined: true,
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

  private checkRegionalDroughtSeason() {
    const forecastSeasonAreas =
      this.countryDisasterSettings.droughtSeasonRegions;
    return Object.values(forecastSeasonAreas).length > 1;
  }

  private filterVisibleLeadTimePerDisasterType(
    disasterType: DisasterType,
    leadTime: LeadTime,
    activeLeadTimes: LeadTimeButtonInput[],
  ): boolean {
    if (disasterType.disasterType === DisasterTypeKey.drought) {
      // hide months that are already covered in the duration of a preceding event/lead-time button
      for (const activeLeadTime of activeLeadTimes) {
        const startLeadTimeNumber = Number(
          LeadTimeTriggerKey[activeLeadTime.leadTime],
        );
        const endLeadTimeNumber = startLeadTimeNumber + activeLeadTime.duration;
        if (
          Number(LeadTimeTriggerKey[leadTime]) < endLeadTimeNumber &&
          Number(LeadTimeTriggerKey[leadTime]) >= startLeadTimeNumber
        ) {
          return false;
        }
      }
      return true;
    } else if (disasterType.disasterType === DisasterTypeKey.typhoon) {
      // show 1 button per day ..
      return (
        [
          LeadTime.hour0,
          LeadTime.hour120,
          LeadTime.hour144,
          LeadTime.hour168,
          LeadTime.hour24,
          LeadTime.hour48,
          LeadTime.hour72,
          LeadTime.hour96,
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

  private filterActiveLeadTimePerDisasterType(
    disasterType: DisasterType,
    leadTime: LeadTime,
  ): boolean {
    if (disasterType.disasterType === DisasterTypeKey.drought) {
      const leadTimeMonth = this.getLeadTimeMonth(leadTime);
      if (this.checkRegionalDroughtSeason()) {
        // If regional drought seasons (and thus potentially multiple triggers) ..
        const alertedLeadTimes = Object.keys(this.alertsAllEvents).filter(
          (lt) => this.alertsAllEvents[lt] === '1',
        );
        // .. show all alerted lead times only
        if (alertedLeadTimes.length) {
          return alertedLeadTimes.includes(leadTime);
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
      const relevantLeadTimes =
        this.eventState?.events?.length > 0
          ? events
              .filter(
                (e) => !e.disasterSpecificProperties?.typhoonNoLandfallYet,
              )
              .map((e) => e.firstLeadTime)
          : [];
      return relevantLeadTimes.includes(leadTime);
    } else if (disasterType.disasterType === DisasterTypeKey.flashFloods) {
      const events = this.eventState?.events;
      if (!events.length) {
        return leadTime === LeadTime.hour1;
      }
      const relevantLeadTimes =
        this.eventState?.events?.length > 0
          ? events.map((e) => e.firstLeadTime)
          : [];
      return relevantLeadTimes.includes(leadTime);
    } else if (disasterType.disasterType === DisasterTypeKey.floods) {
      const events = this.eventState?.events;
      const relevantLeadTimes =
        this.eventState?.events?.length > 0
          ? events.map((e) => e.firstLeadTime)
          : [];
      return relevantLeadTimes.includes(leadTime);
    } else {
      return true;
    }
  }

  private shiftYear = (monthNumber: number) => {
    // Make sure you start counting the year at the beginning of (one of the) seasons, instead of at January
    // so that 'month > currentMonth' does not break on a season like [12,1,2]
    const seasonRegions = this.countryDisasterSettings.droughtSeasonRegions;
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
    const currentYear = this.state.today.year;
    const currentMonth = this.state.today.month;

    let forecastMonthNumbers: number[] = [];
    for (const season of this.getDroughtSeasons()) {
      let filteredSeason: number[];
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
    const addMonths = Number(LeadTimeTriggerKey[leadTime]);
    const leadTimeMonth = this.state.today.plus({
      month: addMonths,
    });
    return DateTime.utc(leadTimeMonth.year, leadTimeMonth.month, 1);
  }

  private getDroughtSeasons = (): number[][] => {
    const seasons: number[][] = [];
    for (const area of Object.values(
      this.countryDisasterSettings.droughtSeasonRegions,
    )) {
      for (const season of Object.values(area)) {
        seasons.push(season.rainMonths);
      }
    }

    return seasons;
  };
}
