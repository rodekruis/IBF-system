import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { AREAS_OF_FOCUS } from 'src/app/models/area-of-focus.const';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevelType } from 'src/app/types/admin-level';
import { EapAction } from 'src/app/types/eap-action';
import { EventState } from 'src/app/types/event-state';
import { LeadTime } from 'src/app/types/lead-time';
import { TimelineState } from 'src/app/types/timeline-state';
import { AlertLabel, TriggeredArea } from 'src/app/types/triggered-area';

@Injectable({
  providedIn: 'root',
})
export class EapActionsService {
  private triggeredAreaSubject = new BehaviorSubject<TriggeredArea[]>([]);
  public triggeredAreas: TriggeredArea[];
  private country: Country;
  private disasterType: DisasterType;
  private countryDisasterSettings: CountryDisasterSettings;
  private eventState: EventState;
  private timelineState: TimelineState;
  private currentRainSeasonName: string;
  private placeCode: PlaceCode;

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
    private timelineService: TimelineService,
    private disasterTypeService: DisasterTypeService,
    private adminLevelService: AdminLevelService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
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

    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
  };

  private onEventStatusChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onAdminLevelChange = () => {
    // This avoids duplicate calls because of adminLevel & placeCode change
    if (this.placeCode) {
      const adminLevelType = this.adminLevelService.getAdminLevelType(
        this.placeCode,
      );
      if (adminLevelType !== AdminLevelType.higher) {
        this.getTriggeredAreasApi();
      }
    } else {
      this.getTriggeredAreasApi();
    }
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.getTriggeredAreasApi();
  };

  private getTriggeredAreasApi() {
    if (
      this.country &&
      this.disasterType &&
      this.timelineState &&
      this.eventState
    ) {
      // This makes sure that if placeCode is set, that adminLevel is used below (which affects e.g. the chat-section) ..
      // .. which is 1 adminLevel highr than the one used in the map ..
      // .. if not set yet (so on highest adminLevel), then the chat-section uses the same level as the map (namely the defaultAdminLevel)
      const adminLevelToUse =
        this.placeCode?.adminLevel ||
        this.countryDisasterSettings.defaultAdminLevel;
      this.apiService
        .getTriggeredAreas(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          adminLevelToUse,
          this.timelineState.activeLeadTime,
          this.eventState.event?.eventName,
        )
        .subscribe(this.onTriggeredAreas);
    }
  }

  private onTriggeredAreas = (triggeredAreas: TriggeredArea[]) => {
    this.triggeredAreas = triggeredAreas;
    this.triggeredAreas.sort((a, b) => {
      if (a.triggerValue === b.triggerValue) {
        return a.actionsValue > b.actionsValue ? -1 : 1;
      } else {
        return a.triggerValue > b.triggerValue ? -1 : 1;
      }
    });
    if (this.getActiveLeadtime()) {
      this.triggeredAreas.forEach((area) => {
        this.formatDates(area);
        this.mapTriggerValueToAlertClass(area);
        this.filterEapActionsByMonth(area);
        area.eapActions.forEach((action) => {
          action.aofLabel = AREAS_OF_FOCUS.find(
            (aof) => aof.id === action.aof,
          ).label;
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
    }
    this.triggeredAreaSubject.next(this.triggeredAreas);
  };

  getTriggeredAreas(): Observable<TriggeredArea[]> {
    return this.triggeredAreaSubject.asObservable();
  }

  private formatDates = (triggeredArea: TriggeredArea) => {
    triggeredArea.startDate = DateTime.fromISO(
      triggeredArea.startDate,
    ).toFormat('cccc, dd LLLL');
  };

  private mapTriggerValueToAlertClass = (triggeredArea: TriggeredArea) => {
    if (triggeredArea.triggerValue === 1) {
      triggeredArea.alertLabel = AlertLabel.trigger;
    } else if (triggeredArea.triggerValue > 0) {
      triggeredArea.alertLabel = AlertLabel.warning;
    }
    // AlertLabel.alert does not need to be defined as {{alertLabel}} is not a variable in the non-eap copy
  };

  private filterEapActionsByMonth = (triggeredArea: TriggeredArea) => {
    if (!this.countryDisasterSettings.showMonthlyEapActions) {
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

    const currentActionSeasonMonths = this.currentRainSeasonName
      ? this.countryDisasterSettings.droughtSeasonRegions[region][
          this.currentRainSeasonName
        ].actionMonths
      : [];

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

  private getRegion(triggeredArea: TriggeredArea): string {
    const nationwideKey = 'National';

    if (!this.countryDisasterSettings.droughtRegions) {
      return nationwideKey;
    }

    const droughtRegions = Object.keys(
      this.countryDisasterSettings.droughtRegions,
    );
    const isTriggeredAreaInDroughtRegion = (droughtRegion: string): boolean =>
      this.countryDisasterSettings.droughtRegions[droughtRegion].includes(
        triggeredArea.placeCode,
      );
    for (const droughtRegion of droughtRegions) {
      if (isTriggeredAreaInDroughtRegion(droughtRegion)) {
        return droughtRegion;
      }
    }
  }

  private getCurrentRainSeasonName(
    region: string,
    monthOfSelectedLeadTime: number,
  ): string {
    const seasons = this.countryDisasterSettings.droughtSeasonRegions[region];
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
    if (this.countryDisasterSettings?.droughtEndOfMonthPipeline) {
      return this.timelineState.today.plus({ months: 1 }).month;
    }
    return this.timelineState.today.month;
  }

  private getActiveLeadtime(): LeadTime {
    return this.timelineState.activeLeadTime;
  }
}
