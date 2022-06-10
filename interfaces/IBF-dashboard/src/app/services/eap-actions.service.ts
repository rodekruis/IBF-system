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
import { LeadTime } from '../types/lead-time';
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
          // EXCEPTION
          // We add 1 month to the due by date for KEN actions because it's assumed the due date is the month after the actionMonth
          const monthAddition = this.country.countryCodeISO3 === 'KEN' ? 1 : 0;
          const decemberValue = this.country.countryCodeISO3 === 'KEN' ? 1 : 12;
          for (const region of Object.keys(action.month)) {
            Object.defineProperty(action.monthLong, region, {
              value: DateTime.utc(
                2022, // year does not matter, this is just about converting month-number to month-name
                action.month[region] === 12
                  ? decemberValue
                  : action.month[region] + monthAddition,
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

    const region = this.getRegion(triggeredArea);

    const periods = this.getActionPeriods(region);

    const currentPeriod = periods.find((p) =>
      p.includes(this.getCurrentMonth()),
    );

    currentPeriod.unshift(
      ...this.currentPeriodOverlapAddition(region, currentPeriod[0]),
    );

    const actionMonthInCurrentPeriod = (action: EapAction) =>
      currentPeriod.includes(action.month[region]);
    const actionMonthBeforeCurrentMonth = (action: EapAction) =>
      currentPeriod.indexOf(action.month[region]) <=
      currentPeriod.indexOf(this.getCurrentMonth());

    triggeredArea.eapActions = triggeredArea.eapActions
      .filter(
        (action: EapAction) =>
          actionMonthInCurrentPeriod(action) &&
          actionMonthBeforeCurrentMonth(action),
      )
      .filter((action: EapAction) =>
        this.actionOverlapFilter(region, action.month[region], action.action),
      )
      .sort(
        (a, b) =>
          a.month[region] &&
          this.getShiftedYear(region).indexOf(a.month[region]) -
            this.getShiftedYear(region).indexOf(b.month[region]),
      );
  };

  private getRegion(triggeredArea): string {
    const nationwideKey = 'National';

    if (!this.disasterTypeSettings.droughtAreas) {
      return nationwideKey;
    }

    const droughtAreas = Object.keys(this.disasterTypeSettings.droughtAreas);
    const isTriggeredAreaInDroughtArea = (droughtArea): boolean =>
      this.disasterTypeSettings.droughtAreas[droughtArea].includes(
        triggeredArea.placeCode,
      );
    for (const droughtArea of droughtAreas) {
      if (isTriggeredAreaInDroughtArea(droughtArea)) {
        return droughtArea;
      }
    }
  }

  private getSeasonEnds(region): number[] {
    return this.disasterTypeSettings.droughtForecastMonths[region]
      .map((season) => season[season.length - 1])
      .sort((a, b) => b - a);
  }

  private getShiftedYear(region): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
      const newMonthValue = (m + this.getSeasonEnds(region)[0]) % 12;
      return newMonthValue > 0 ? newMonthValue : 12;
    });
  }

  private getActionPeriods(region): number[][] {
    const periods = [];
    let period = [];
    for (const month of this.getShiftedYear(region)) {
      period.push(month);
      if (this.getSeasonEnds(region).includes(month)) {
        periods.push(period);
        period = [];
      }
    }

    return periods;
  }

  private currentPeriodOverlapAddition(
    region: string,
    periodStart: number,
  ): number[] {
    if (this.disasterType.disasterType === 'drought') {
      if (
        this.country.countryCodeISO3 === 'ETH' &&
        region === 'Belg' &&
        periodStart === 6
      ) {
        return [5];
      }

      if (this.country.countryCodeISO3 === 'KEN' && periodStart === 1) {
        return [12];
      }
    }

    return [];
  }

  private actionOverlapFilter(
    region: string,
    actionMonth: number,
    actionId: string,
  ): boolean {
    if (this.disasterType.disasterType !== 'drought') {
      return true;
    }

    const country = this.country.countryCodeISO3;

    if (!['ETH', 'KEN'].includes(country)) {
      return true;
    }

    if (country === 'ETH') {
      if (region !== 'Belg' || ![5, 6].includes(this.getCurrentMonth())) {
        return true;
      }

      if (actionMonth !== 5) {
        return true;
      }

      const firstSeasonMayActions = ['eth-1-c9'];
      const secondSeasonMayActions = [
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
      const mayActionsToShow = {
        5: {
          [LeadTime.month0]: firstSeasonMayActions,
          [LeadTime.month1]: secondSeasonMayActions,
        },
        6: {
          [LeadTime.month0]: secondSeasonMayActions,
        },
      };
      return mayActionsToShow[this.getCurrentMonth()][
        this.getActiveLeadtime()
      ].includes(actionId);
    }

    if (country === 'KEN') {
      if (![12, 1].includes(this.getCurrentMonth())) {
        return true;
      }

      if (actionMonth !== 12) {
        return true;
      }

      const firstSeasonDecemberActions = [];
      const secondSeasonDecemberActions = ['livelihood-5', 'wash-7', 'wash-8'];

      const decemberActionsToShow = {
        12: {
          [LeadTime.month0]: firstSeasonDecemberActions,
          [LeadTime.month1]: secondSeasonDecemberActions,
        },
        1: {
          [LeadTime.month0]: secondSeasonDecemberActions,
        },
      };

      return decemberActionsToShow[this.getCurrentMonth()][
        this.getActiveLeadtime()
      ].includes(actionId);
    }
  }

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

  private getCurrentMonth(): number {
    // SIMULATE: uncomment the line below and change the number to simulate different months
    // return 9;
    return this.timelineState.today.month;
  }

  private getActiveLeadtime(): LeadTime {
    console.log(
      '=== this.timelineState.activeLeadTime: ',
      this.timelineState.activeLeadTime,
    );
    return this.timelineState.activeLeadTime;
  }
}
