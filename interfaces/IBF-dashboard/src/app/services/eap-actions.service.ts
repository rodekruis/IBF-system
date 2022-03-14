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
import { EventState } from '../types/event-state';
import { TimelineState } from '../types/timeline-state';
import { AdminLevelService } from './admin-level.service';
import { DisasterTypeService } from './disaster-type.service';
import { EventService, EventSummary } from './event.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class EapActionsService {
  private triggeredAreaSubject = new BehaviorSubject<any[]>([]);
  public triggeredAreas: any[];
  private country: Country;
  private disasterType: DisasterType;
  public disasterTypeSettings: CountryDisasterSettings;
  private adminLevel: AdminLevel;
  private event: EventSummary;
  private eventState: EventState;
  public timelineState: TimelineState;

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
    this.loadAdminAreasAndActions();
  };

  private onTriggeredAreas = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
    this.triggeredAreas.sort((a, b) =>
      a.actionsValue > b.actionsValue ? -1 : 1,
    );
    this.triggeredAreas.forEach((area) => {
      this.formatDates(area);
      this.filterEapActionsByMonth(area);
      area.eapActions.forEach((action) => {
        action.monthLong = DateTime.utc(
          2022, // year does not matter, this is just about converting month-number to month-name
          action.month === 12 ? 1 : action.month + 1, // The due-by date of actions lies one month later then when it's added
          1,
        ).monthLong;
      });
    });
    this.triggeredAreaSubject.next(this.triggeredAreas);
  };

  private formatDates = (triggeredArea) => {
    triggeredArea.startDate = DateTime.fromISO(
      triggeredArea.startDate,
    ).toFormat('cccc, dd LLLL');
    triggeredArea.stoppedDate = DateTime.fromISO(
      triggeredArea.stoppedDate,
    ).toFormat('cccc, dd LLLL');
  };

  private filterEapActionsByMonth = (triggeredArea) => {
    const currentMonth = this.timelineState.today.month;
    triggeredArea.filteredEapActions = triggeredArea.eapActions
      .filter(
        (action) =>
          !action.month || // If no month provided, then we assume static EAP-actions and show all
          this.showMonthlyAction(action.month, currentMonth),
      )
      .sort((a, b) =>
        a.month && this.shiftYear(a.month) > this.shiftYear(b.month) ? 1 : -1,
      );
  };

  private showMonthlyAction(month, currentMonth) {
    if (!this.disasterTypeSettings.showMonthlyEapActions) {
      return;
    }
    const monthBeforeCurrentMonth =
      this.shiftYear(month) <= this.shiftYear(currentMonth);
    // TO DO: make this generic instead of hard-coded
    if (currentMonth < 3 || currentMonth >= 10) {
      return [10, 11, 12, 1, 2].includes(month) && monthBeforeCurrentMonth;
    } else if (currentMonth >= 3 && currentMonth < 10) {
      return [3, 4, 5, 6, 7, 8, 9].includes(month) && monthBeforeCurrentMonth;
    }
  }

  // This makes the year "start" at the moment of one of the "droughtForecastMonths" instead of in January ..
  // .. thereby making sure that the order is correct: 'december' comes before 'january', etc.
  private shiftYear = (monthNumber: number) => {
    const droughtForecastMonths = this.disasterTypeSettings
      .droughtForecastMonths;
    return (monthNumber + 12 - droughtForecastMonths[0]) % 12;
  };

  private onEvent = (events) => {
    this.event = events[0];
    if (this.event && this.timelineState.activeLeadTime) {
      this.getTriggeredAreasApi(
        this.timelineState.activeLeadTime,
        this.adminLevel || this.disasterTypeSettings.defaultAdminLevel,
      );
    }
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    if (this.event && this.timelineState.activeLeadTime) {
      this.getTriggeredAreasApi(
        this.timelineState.activeLeadTime,
        this.adminLevel || this.disasterTypeSettings.defaultAdminLevel,
      );
    }
  };

  private onAdminLevelChange = (adminLevel: AdminLevel) => {
    if (this.event && this.timelineState?.activeLeadTime && adminLevel) {
      this.getTriggeredAreasApi(this.timelineState?.activeLeadTime, adminLevel);
    }
  };

  private getTriggeredAreasApi(leadTime: string, adminLevel: AdminLevel) {
    if (this.disasterType) {
      this.apiService
        .getTriggeredAreas(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          adminLevel,
          leadTime,
          this.eventState?.event?.eventName,
        )
        .subscribe(this.onTriggeredAreas);
    }
  }

  loadAdminAreasAndActions() {
    if (this.country && this.disasterType) {
      this.apiService
        .getEventsSummary(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onEvent);
    }
  }

  getTriggeredAreas(): Observable<any[]> {
    return this.triggeredAreaSubject.asObservable();
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

  private onEventStatusChange(eventState: EventState) {
    this.eventState = eventState;
  }
}
