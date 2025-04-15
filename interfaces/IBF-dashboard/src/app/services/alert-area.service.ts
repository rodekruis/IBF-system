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
import { AlertArea } from 'src/app/types/alert-area';
import { EapAction } from 'src/app/types/eap-action';
import { EventState } from 'src/app/types/event-state';
import { LeadTime } from 'src/app/types/lead-time';
import { TimelineState } from 'src/app/types/timeline-state';

@Injectable({
  providedIn: 'root',
})
export class AlertAreaService {
  private alertAreaSubject = new BehaviorSubject<AlertArea[]>([]);
  public alertAreas: AlertArea[];
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
        this.loadAlertAreas();
      }
    } else {
      this.loadAlertAreas();
    }
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.loadAlertAreas();
  };

  private loadAlertAreas() {
    if (
      this.country &&
      this.disasterType &&
      this.timelineState &&
      this.eventState
    ) {
      const adminLevelToUse =
        this.placeCode?.adminLevel ||
        this.countryDisasterSettings.defaultAdminLevel;
      if (adminLevelToUse > this.countryDisasterSettings.defaultAdminLevel) {
        this.apiService
          .getAlertAreas(
            this.country.countryCodeISO3,
            this.disasterType.disasterType,
            adminLevelToUse,
            this.eventState.event?.eventName,
          )
          .subscribe(this.processAlertAreas);
      } else if (this.eventState?.event) {
        this.processAlertAreas(this.eventState.event.alertAreas);
      } else if (this.eventState?.events.length) {
        // Multiple events case - concatenate all alertAreas arrays
        const allAlertAreas = this.eventState.events.flatMap(
          (event) => event.alertAreas || [],
        );
        this.processAlertAreas(allAlertAreas);
      } else {
        this.processAlertAreas([]);
      }
    }
  }

  private processAlertAreas = (alertAreas: AlertArea[]) => {
    this.alertAreas = alertAreas;
    this.alertAreas.sort((a, b) => {
      if (a.forecastSeverity === b.forecastSeverity) {
        return a.mainExposureValue > b.mainExposureValue ? -1 : 1;
      } else {
        return a.forecastSeverity > b.forecastSeverity ? -1 : 1;
      }
    });
    if (this.getActiveLeadtime()) {
      this.alertAreas.forEach((area) => {
        this.formatDates(area);
        this.filterEapActionsByMonth(area);
        area.eapActions.forEach((action) => {
          action.aofLabel = AREAS_OF_FOCUS.find(
            (aof) => aof.id === action.aof,
          ).label;
          if (action?.month && Object.keys(action.month).length) {
            action.monthLong = {} as JSON;
            for (const region of Object.keys(action.month)) {
              action.monthLong[region] = DateTime.utc(
                2022,
                action.month[region][this.currentRainSeasonName],
                1,
              ).monthLong;
            }
          } else {
            action.month = null;
          }
        });
      });
    }
    // REFACTOR: there is no longer need for a subscription here, as this data is not retrieved from API here, but already earlier known. Clean up the subscription chain.
    this.alertAreaSubject.next(this.alertAreas);
  };

  getAlertAreas(): Observable<AlertArea[]> {
    return this.alertAreaSubject.asObservable();
  }

  private formatDates = (alertArea: AlertArea) => {
    alertArea.firstIssuedDate = DateTime.fromISO(
      alertArea.firstIssuedDate,
    ).toFormat('cccc, dd LLLL');
  };

  private filterEapActionsByMonth = (alertArea: AlertArea) => {
    if (!this.countryDisasterSettings.showMonthlyEapActions) {
      return;
    }

    const region = this.getRegion(alertArea);
    this.currentRainSeasonName = alertArea.eventName.split('_')[0];

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

    alertArea.eapActions = alertArea.eapActions
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

  private getRegion(alertArea: AlertArea): string {
    const nationwideKey = 'National';

    if (!this.countryDisasterSettings.droughtRegions) {
      return nationwideKey;
    }

    const droughtRegions = Object.keys(
      this.countryDisasterSettings.droughtRegions,
    );
    const isAlertAreaInDroughtRegion = (droughtRegion: string): boolean =>
      this.countryDisasterSettings.droughtRegions[droughtRegion].includes(
        alertArea.placeCode,
      );
    for (const droughtRegion of droughtRegions) {
      if (isAlertAreaInDroughtRegion(droughtRegion)) {
        return droughtRegion;
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
    return this.timelineState.today.month;
  }

  private getActiveLeadtime(): LeadTime {
    return this.timelineState.activeLeadTime;
  }
}
