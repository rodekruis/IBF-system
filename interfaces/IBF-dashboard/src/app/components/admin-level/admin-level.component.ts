import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import {
  AdminLevelButton,
  AdminLevelService,
} from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { MapViewService } from 'src/app/services/map-view.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { AdminLevel, AdminLevelType } from 'src/app/types/admin-level';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import { IbfLayer, IbfLayerGroup, IbfLayerName } from 'src/app/types/ibf-layer';
import { MapView } from 'src/app/types/map-view';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLevelComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  public country: Country;
  public disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;

  public mapViewEnum = MapView;
  public currentMapView: MapView;
  private mapViewSubscription: Subscription;

  public adminLevelButtons: Observable<AdminLevelButton[]>;

  public adminLevel = AdminLevel;

  private eventStateSubscription: Subscription;
  public eventState: EventState;

  private placeCodeSubscription: Subscription;
  public placeCode: PlaceCode;

  private breadcrumbDisasters = [
    DisasterTypeKey.flashFloods,
    DisasterTypeKey.heavyRain,
    // DisasterTypeKey.malaria, // TODO: after switching to event-based, but events being defined in time, not in space, the breadcrumbs no longer made sense. Easiest to disable.
    DisasterTypeKey.floods,
  ];

  constructor(
    public adminLevelService: AdminLevelService,
    private mapService: MapService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private mapViewService: MapViewService,
    public translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.mapViewSubscription = this.mapViewService
      .getBreadcrumbsMapViewSubscription()
      .subscribe(this.onMapViewChange);

    this.eventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);

    this.adminLevelButtons =
      this.adminLevelService.getAdminLevelButtonsSubscription();
  }
  ngOnDestroy(): void {
    this.mapViewSubscription.unsubscribe();
    this.eventStateSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
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

  private onMapViewChange = (view: MapView) => {
    this.currentMapView = view;
    this.changeDetectorRef.detectChanges();
  };

  private onEventChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.changeDetectorRef.detectChanges();
  };

  public clickAdminLevelButton(adminLevel: AdminLevel): void {
    const layer = this.getAdminLevelLayer(adminLevel);

    if (adminLevel !== this.adminLevelService.adminLevel) {
      this.adminLevelService.activeLayerNames = this.mapService.layers
        .filter((l) => l.active && l.group !== IbfLayerGroup.adminRegions)
        .map((l) => l.name);
      this.placeCodeService.clearPlaceCode();
      this.adminLevelService.setAdminLevel(adminLevel);

      this.analyticsService.logEvent(AnalyticsEvent.adminLevel, {
        adminLevel,
        adminLevelState: layer.active,
        page: AnalyticsPage.dashboard,
        isActiveTrigger: this.eventService.state.events?.length > 0,
        component: this.constructor.name,
      });
    } else {
      this.mapService.toggleLayer(layer);
    }
  }

  public isAdminLevelActive = (
    adminLevel: AdminLevel,
    disabled: boolean,
  ): boolean => {
    const layer = this.getAdminLevelLayer(adminLevel);
    if (!layer) {
      return false;
    }

    return layer.active && !disabled;
  };

  public getAdminLevelLabel(adminLevel: AdminLevel): string {
    return this.adminLevelService.adminLevelLabel
      ? this.adminLevelService.adminLevelLabel[AdminLevel[adminLevel]]
      : `Admin Level ${AdminLevel[adminLevel]}`;
  }

  private getAdminLevelLayerName(adminLevel: AdminLevel): IbfLayerName {
    return `${IbfLayerGroup.adminRegions}${AdminLevel[adminLevel]}` as IbfLayerName;
  }

  public getAdminLevelLayer(adminLevel: AdminLevel): IbfLayer {
    const layerName = this.getAdminLevelLayerName(adminLevel);
    return this.mapService.getLayerByName(layerName);
  }

  public useBreadcrumbs(disasterType: DisasterType): boolean {
    return this.breadcrumbDisasters.includes(disasterType?.disasterType);
  }

  public clickBreadcrumbButton(breadCrumb: MapView, selected: boolean) {
    if (selected) {
      return;
    }

    // This currently only applies for UGA floods level 4 to 3
    if (breadCrumb === MapView.adminArea2) {
      if (
        this.adminLevelService.getAdminLevelType(this.placeCode) !==
        AdminLevelType.deepest
      ) {
        this.adminLevelService.zoomOutAdminLevel();
      }
      this.placeCodeService.setPlaceCode(this.placeCode.placeCodeParent);
    }

    // This has to work for the following scenarios
    // scenario 1: UGA floods level 4 to 2
    // scenario 2: UGA floods level 3 to 2 (where 3 is not deepest)
    // scenario 3: ZMB floods level 3 to 2 (where 3 is deepest)
    if (breadCrumb === MapView.adminArea) {
      if (this.currentMapView === MapView.adminArea3) {
        this.adminLevelService.zoomOutAdminLevel();
        this.placeCodeService.setPlaceCode(
          this.placeCode.placeCodeParent.placeCodeParent,
        );
      } else if (this.currentMapView === this.mapViewEnum.adminArea2) {
        if (
          this.adminLevelService.getAdminLevelType(this.placeCode) !==
          AdminLevelType.deepest
        ) {
          this.adminLevelService.zoomOutAdminLevel();
        }
        this.placeCodeService.setPlaceCode(this.placeCode.placeCodeParent);
      }
    }

    if (breadCrumb === MapView.event) {
      this.adminLevelService.zoomToDefaultAdminLevel();
      this.placeCodeService?.clearPlaceCode();
      return;
    }

    if (breadCrumb === MapView.national) {
      if (this.countryDisasterSettings?.isEventBased) {
        this.eventService?.resetEvents();
        return;
      } else {
        this.adminLevelService.zoomToDefaultAdminLevel();
        this.placeCodeService?.clearPlaceCode();
        return;
      }
    }
  }

  public showBreadcrumb(breadCrumb: MapView): boolean {
    if (breadCrumb === MapView.national) {
      return [
        MapView.adminArea,
        MapView.adminArea2,
        MapView.adminArea3,
        MapView.event,
        MapView.national,
      ].includes(this.currentMapView);
    } else if (breadCrumb === MapView.event) {
      return (
        [
          MapView.adminArea,
          MapView.adminArea2,
          MapView.adminArea3,
          MapView.event,
        ].includes(this.currentMapView) &&
        this.countryDisasterSettings?.isEventBased
      );
    } else if (breadCrumb === MapView.adminArea) {
      return [
        MapView.adminArea,
        MapView.adminArea2,
        MapView.adminArea3,
      ].includes(this.currentMapView);
    } else if (breadCrumb === MapView.adminArea2) {
      return [MapView.adminArea2, MapView.adminArea3].includes(
        this.currentMapView,
      );
    } else if (breadCrumb === MapView.adminArea3) {
      return [MapView.adminArea3].includes(this.currentMapView);
    }
  }

  public disableNationalView(): boolean {
    return this.eventState?.events?.length === 1;
  }
}
