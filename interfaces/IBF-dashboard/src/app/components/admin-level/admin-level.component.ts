import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import {
  AdminLevelButton,
  AdminLevelService,
} from 'src/app/services/admin-level.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { AdminLevel } from 'src/app/types/admin-level';
import { IbfLayer, IbfLayerGroup, IbfLayerName } from 'src/app/types/ibf-layer';
import { Country, DisasterType } from '../../models/country.model';
import { PlaceCode } from '../../models/place-code.model';
import { CountryService } from '../../services/country.service';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { MapViewService } from '../../services/map-view.service';
import { PlaceCodeService } from '../../services/place-code.service';
import { EventState } from '../../types/event-state';
import { MapView } from '../../types/map-view';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
})
export class AdminLevelComponent implements OnInit, OnDestroy {
  public country: Observable<Country>;
  public disasterType: Observable<DisasterType>;

  public mapViewEnum = MapView;
  public currentMapView: MapView;
  private mapViewSubscription: Subscription;

  private countryDisasterAdminLevelsSubscirption: Subscription;
  public adminLevelButtons: Observable<AdminLevelButton[]>;

  public adminLevel = AdminLevel;

  public eventState: Observable<EventState>;

  public placeCode: Observable<PlaceCode>;

  private breadcrumbCountryDisasters = ['MWI_flash-floods'];

  constructor(
    public adminLevelService: AdminLevelService,
    private mapService: MapService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private mapViewService: MapViewService,
  ) {}

  ngOnInit(): void {
    this.country = this.countryService.getCountrySubscription();
    this.disasterType = this.disasterTypeService.getDisasterTypeSubscription();
    // this.currentMapView = this.mapViewService.getBreadcrumbsMapViewSubscription();
    this.mapViewSubscription = this.mapViewService
      .getBreadcrumbsMapViewSubscription()
      .subscribe((view) => (this.currentMapView = view));
    this.eventState = this.eventService.getManualEventStateSubscription();
    this.adminLevelButtons = this.adminLevelService.getAdminLevelButtonsSubscription();
    this.placeCode = this.placeCodeService.getPlaceCodeSubscription();
  }
  ngOnDestroy(): void {
    this.countryDisasterAdminLevelsSubscirption.unsubscribe();
    this.mapViewSubscription.unsubscribe();
  }

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
        isActiveTrigger: this.eventService.state.activeTrigger,
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
      : `Admin Level ${adminLevel}`;
  }

  private getAdminLevelLayerName(adminLevel: AdminLevel): IbfLayerName {
    return `${IbfLayerGroup.adminRegions}${adminLevel}` as IbfLayerName;
  }

  public getAdminLevelLayer(adminLevel: AdminLevel): IbfLayer {
    const layerName = this.getAdminLevelLayerName(adminLevel);
    return this.mapService.getLayerByName(layerName);
  }

  public useBreadcrumbs(country: Country, disasterType: DisasterType): boolean {
    return this.breadcrumbCountryDisasters.includes(
      `${country?.countryCodeISO3}_${disasterType?.disasterType}`,
    );
  }

  public clickBreadcrumbButton(view: MapView, selected: boolean) {
    if (selected) {
      return;
    }

    if (view === MapView.national) {
      this.eventService?.resetEvents();
      return;
    }

    if (view === MapView.event) {
      this.placeCodeService?.clearPlaceCode();
      return;
    }
  }

  public showNationalBreadcrumb(): boolean {
    return [MapView.national, MapView.event, MapView.adminArea].includes(
      this.currentMapView,
    );
  }

  public showEventBreadcrumb(): boolean {
    return [MapView.event, MapView.adminArea].includes(this.currentMapView);
  }

  public showAdminAreaBreadcrumb(): boolean {
    return [MapView.adminArea].includes(this.currentMapView);
  }
}
