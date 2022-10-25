import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminLevel, AdminLevelLabel } from 'src/app/types/admin-level';
import { Country, DisasterType } from '../models/country.model';
import { EventState } from '../types/event-state';
import { IbfLayerName } from '../types/ibf-layer';
import { TimelineState } from '../types/timeline-state';
import { CountryService } from './country.service';
import { DisasterTypeService } from './disaster-type.service';
import { EventService } from './event.service';
import { TimelineService } from './timeline.service';

@Injectable({
  providedIn: 'root',
})
export class AdminLevelService {
  private adminLevelSubject = new BehaviorSubject<AdminLevel>(
    AdminLevel.adminLevel1,
  );
  public oldAdminLevel: AdminLevel = null;
  public adminLevel: AdminLevel;
  public countryAdminLevels: AdminLevel[];
  public adminLevelLabel: AdminLevelLabel = new AdminLevelLabel();
  public activeLayerNames: IbfLayerName[] = [];

  private country: Country;
  private disasterType: DisasterType;
  private eventState: EventState;
  private timelineState: TimelineState;

  private static loadAdminLevelLabels(country: Country): AdminLevelLabel {
    const adminLevelLabels = {
      adminLevel1: '',
      adminLevel2: '',
      adminLevel3: '',
      adminLevel4: '',
    };

    if (country.adminRegionLabels[1]) {
      adminLevelLabels.adminLevel1 = country.adminRegionLabels[1].plural;
    }
    if (country.adminRegionLabels[2]) {
      adminLevelLabels.adminLevel2 = country.adminRegionLabels[2].plural;
    }
    if (country.adminRegionLabels[3]) {
      adminLevelLabels.adminLevel3 = country.adminRegionLabels[3].plural;
    }
    if (country.adminRegionLabels[4]) {
      adminLevelLabels.adminLevel4 = country.adminRegionLabels[4].plural;
    }

    return adminLevelLabels;
  }

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private eventService: EventService,
    private timelineService: TimelineService,
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

    this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.activeLayerNames = [];
  };

  private onInitialEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
    this.activeLayerNames = [];
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    if (
      this.country &&
      this.disasterType &&
      this.eventState &&
      this.timelineState
    ) {
      this.processAdminLevel();
    }
  };

  private processAdminLevel() {
    this.countryAdminLevels = this.country.countryDisasterSettings.find(
      (s) => s.disasterType === this.disasterType.disasterType,
    ).adminLevels;
    this.setAdminLevel(
      this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).defaultAdminLevel,
    );
    this.adminLevelLabel = AdminLevelService.loadAdminLevelLabels(this.country);
  }

  getAdminLevelSubscription = (): Observable<AdminLevel> => {
    return this.adminLevelSubject.asObservable();
  };

  public setAdminLevel(adminLevel: AdminLevel) {
    this.adminLevel = adminLevel;
    this.adminLevelSubject.next(this.adminLevel);
  }
}
