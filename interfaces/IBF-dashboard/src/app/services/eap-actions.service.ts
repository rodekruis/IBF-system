import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from '../models/country.model';
import { AdminLevel } from '../types/admin-level';
import { EapAction } from '../types/eap-action';
import { EventState } from '../types/event-state';
import { TimelineState } from '../types/timeline-state';
import { AdminLevelService } from './admin-level.service';
import { DisasterTypeService } from './disaster-type.service';
import { EventService } from './event.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class EapActionsService {
  private triggeredAreaSubject = new BehaviorSubject<any[]>([]);
  public triggeredAreas: any[];
  private country: Country;
  private disasterType: DisasterType;
  private disasterTypeSettings: CountryDisasterSettings;
  private adminLevel: AdminLevel;
  private eventState: EventState;
  private timelineState: TimelineState;

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
    private timelineService: TimelineService,
    private disasterTypeService: DisasterTypeService,
    private adminLevelService: AdminLevelService,
    private eventService: EventService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.adminLevelService
      .getAdminLevelSubscription()
      .subscribe(this.onAdminLevelChange);

    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStatusChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.disasterTypeSettings = this.country?.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
    );
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    this.getTriggeredAreasApi();
  };

  private onEventStatusChange = (eventState: EventState) => {
    this.eventState = eventState;
    this.getTriggeredAreasApi();
  };

  private onAdminLevelChange = (adminLevel: AdminLevel) => {
    this.adminLevel = adminLevel;
    this.getTriggeredAreasApi();
  };

  public getTriggeredAreasApi() {
    if (
      this.country &&
      this.disasterType &&
      this.adminLevel &&
      this.timelineState?.activeLeadTime &&
      this.eventState
    ) {
      this.apiService
        .getTriggeredAreas(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.adminLevel,
          this.timelineState.activeLeadTime,
          this.eventState.event?.eventName,
        )
        .subscribe(this.onTriggeredAreas);
    }
  }

  private onTriggeredAreas = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
    this.triggeredAreas.sort((a, b) =>
      a.actionsValue > b.actionsValue ? -1 : 1,
    );
    this.triggeredAreas.forEach((area) => {
      this.formatDates(area);
      this.filterEapActionsByMonth(area);
      area.eapActions.forEach((action) => {
        if (action.month) {
          Object.defineProperty(action, 'monthLong', {
            value: {},
          });
          for (const region of Object.keys(action.month)) {
            Object.defineProperty(action.monthLong, region, {
              value: DateTime.utc(
                2022, // year does not matter, this is just about converting month-number to month-name
                action.month[region] === 12 ? 1 : action.month[region], // Add 1 to due-by date
                1,
              ).monthLong,
            });
          }
        }
      });
    });
    this.triggeredAreaSubject.next(this.triggeredAreas);
  };

  getTriggeredAreas(): Observable<any[]> {
    return this.triggeredAreaSubject.asObservable();
  }

  private formatDates = (triggeredArea) => {
    triggeredArea.startDate = DateTime.fromISO(
      triggeredArea.startDate,
    ).toFormat('cccc, dd LLLL');
    triggeredArea.stoppedDate = DateTime.fromISO(
      triggeredArea.stoppedDate,
    ).toFormat('cccc, dd LLLL');
  };

  private filterEapActionsByMonth = (triggeredArea) => {
    if (!this.disasterTypeSettings.showMonthlyEapActions) {
      return;
    }

    const nationwideKey = 'National';

    let region: string;
    if (!this.disasterTypeSettings.droughtAreas) {
      region = nationwideKey;
    } else {
      for (const droughtArea of Object.keys(
        this.disasterTypeSettings.droughtAreas,
      )) {
        if (
          this.disasterTypeSettings.droughtAreas[droughtArea].includes(
            triggeredArea.placeCode,
          )
        ) {
          region = droughtArea;
          break;
        }
      }
    }

    const seasonEnds = this.disasterTypeSettings.droughtForecastMonths[region]
      .map((season) => season[season.length - 1])
      .sort((a, b) => b - a);

    const periods = [];
    const shiftedYear = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
      const newMonthValue = (m + seasonEnds[0]) % 12;
      return newMonthValue > 0 ? newMonthValue : 12;
    });
    let period = [];
    shiftedYear.forEach((m) => {
      period.push(m);
      if (seasonEnds.includes(m)) {
        periods.push(period);
        period = [];
      }
    });

    const currentMonth = this.timelineState.today.month;
    const currentPeriod = periods.find((p) => p.includes(currentMonth));

    triggeredArea.eapActions = triggeredArea.eapActions
      .filter((action: EapAction) =>
        this.showMonthlyAction(action, currentMonth, currentPeriod, region),
      )
      .sort((a, b) =>
        a.month[region] &&
        this.shiftYear(a.month[region], region) >
          this.shiftYear(b.month[region], region)
          ? 1
          : -1,
      );
  };
  private showMonthlyAction(action, currentMonth, currentPeriod, region) {
    const month = action.month[region];

    // TODO find a way to avoid using this hardcoded filter to manage the "Belg" May overlap
    const belgMayFirstSeasonActions = ['eth-1-c9'];
    const belgMaySecondSeasonActions = [
      'eth-2-a2',
      'eth-2-a3',
      'eth-2-a6',
      'eth-2-a9',
      'eth-2-a11',
      'eth-2-b2',
      'eth-2-b3',
      'eth-2-b5',
      'eth-2-b9',
      'eth-2-b10',
      'eth-2-b11',
      'eth-2-c2',
      'eth-2-c10',
      'eth-2-c11',
      'eth-2-c12',
    ];

    if (region === 'Belg') {
      if (currentMonth === 5) {
        if (this.timelineState.activeLeadTime === '0-month') {
          if (belgMaySecondSeasonActions.includes(action.action)) {
            return false;
          }
        } else {
          if (belgMayFirstSeasonActions.includes(action.action)) {
            return false;
          }
          if (belgMaySecondSeasonActions.includes(action.action)) {
            return true;
          }
        }
      }
      if (currentMonth > 5) {
        if (belgMayFirstSeasonActions.includes(action.action)) {
          return false;
        }
        if (belgMaySecondSeasonActions.includes(action.action)) {
          return true;
        }
      }
    }

    const monthBeforeCurrentMonth =
      this.shiftYear(month, region) <= this.shiftYear(currentMonth, region);

    const show = currentPeriod.includes(month) && monthBeforeCurrentMonth;

    return show;
  }

  // This makes the year "start" at the moment of one of the "droughtForecastMonths" instead of in January ..
  // .. thereby making sure that the order is correct: 'december' comes before 'january', etc.
  private shiftYear = (monthNumber: number, region: string) => {
    const seasonBeginnings = this.disasterTypeSettings.droughtForecastMonths[
      region
    ].map((season) => season[0]);
    return (monthNumber + 12 - seasonBeginnings[0]) % 12;
  };

  checkEapAction(
    action: string,
    status: boolean,
    placeCode: string,
    eventName: string,
  ) {
    return this.apiService.checkEapAction(
      action,
      this.country.countryCodeISO3,
      this.disasterType.disasterType,
      status,
      placeCode,
      eventName,
    );
  }
}
