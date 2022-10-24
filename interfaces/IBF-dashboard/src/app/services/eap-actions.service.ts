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
  private currentRainSeasonName: string;

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
  };

  private onEventStatusChange = (eventState: EventState) => {
    this.eventState = eventState;
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
      if (
        this.disasterTypeSettings.adminLevels.includes(this.adminLevel) &&
        this.disasterTypeSettings.activeLeadTimes.includes(
          this.timelineState?.activeLeadTime,
        ) &&
        // if eventName (=typhoon) then event's leadtime must correspond with timeline's leadtime
        (!this.eventState.event?.eventName ||
          this.eventState.event?.firstLeadTime ===
            this.timelineState.activeLeadTime)
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
        if (Object.keys(action.month).length) {
          Object.defineProperty(action, 'monthLong', {
            value: {},
          });
          for (const region of Object.keys(action.month)) {
            Object.defineProperty(action.monthLong, region, {
              value: DateTime.utc(
                2022, // year does not matter, this is just about converting month-number to month-name
                action.month[region][this.currentRainSeasonName],
                1,
              ).monthLong,
            });
          }
        } else {
          action.month = null;
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

    let monthOfSelectedLeadTime =
      this.getCurrentMonth() + Number(this.getActiveLeadtime().split('-')[0]);
    monthOfSelectedLeadTime =
      monthOfSelectedLeadTime > 12
        ? monthOfSelectedLeadTime - 12
        : monthOfSelectedLeadTime;

    this.currentRainSeasonName = this.getCurrentRainSeasonName(
      region,
      monthOfSelectedLeadTime,
    );

    const currentActionSeasonMonths = this.disasterTypeSettings
      .droughtForecastSeasons[region][this.currentRainSeasonName].actionMonths;

    const actionMonthInCurrentActionSeasonMonths = (action: EapAction) =>
      currentActionSeasonMonths.includes(
        action.month[region][this.currentRainSeasonName],
      );

    const actionMonthBeforeCurrentMonth = (action: EapAction) =>
      currentActionSeasonMonths.indexOf(
        action.month[region][this.currentRainSeasonName],
      ) <= currentActionSeasonMonths.indexOf(this.getCurrentMonth());

    triggeredArea.eapActions = triggeredArea.eapActions
      .filter(
        (action: EapAction) =>
          actionMonthInCurrentActionSeasonMonths(action) &&
          actionMonthBeforeCurrentMonth(action),
      )
      .sort(
        (a, b) =>
          a.month[region] &&
          currentActionSeasonMonths.indexOf(
            a.month[region][this.currentRainSeasonName],
          ) -
            currentActionSeasonMonths.indexOf(
              b.month[region][this.currentRainSeasonName],
            ),
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

  private getCurrentRainSeasonName(region, monthOfSelectedLeadTime): string {
    const seasons = this.disasterTypeSettings.droughtForecastSeasons[region];
    for (const season of Object.keys(seasons)) {
      if (seasons[season].rainMonths.includes(monthOfSelectedLeadTime)) {
        return season;
      }
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
    if (
      this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).droughtEndOfMonthPipeline
    ) {
      return this.timelineState.today.plus({ months: 1 }).month;
    }
    return this.timelineState.today.month;
  }

  private getActiveLeadtime(): LeadTime {
    return this.timelineState.activeLeadTime;
  }
}
