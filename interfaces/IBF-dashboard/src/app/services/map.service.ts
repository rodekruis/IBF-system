import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import { CRS, LatLngBoundsLiteral } from 'leaflet';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import {
  IbfLayer,
  IbfLayerGroup,
  IbfLayerLabel,
  IbfLayerMetadata,
  IbfLayerName,
  IbfLayerType,
  IbfLayerWMS,
} from 'src/app/types/ibf-layer';
import { Indicator } from 'src/app/types/indicator-group';
import { LeadTime } from 'src/app/types/lead-time';
import { environment } from 'src/environments/environment';
import { quantile } from 'src/shared/utils';
import { Country, DisasterType } from '../models/country.model';
import { LayerActivation } from '../models/layer-activation.enum';
import { breakKey } from '../models/map.model';
import { AdminLevel } from '../types/admin-level';
import { DisasterTypeKey } from '../types/disaster-type-key';
import { DisasterTypeService } from './disaster-type.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private layerSubject = new BehaviorSubject<IbfLayer>(null);
  public layers = [] as IbfLayer[];
  public alertColor = 'var(--ion-color-ibf-trigger-alert-secondary)';
  public safeColor = 'var(--ion-color-ibf-no-alert-secondary)';
  public hoverFillOpacity = 0.6;
  private unselectedFillOpacity = 0.4;
  private disputedBorderStyle = {
    weight: 2,
    dashArray: '5 5',
    color: this.alertColor,
  };
  private layerDataCache = {};

  public state = {
    bounds: [
      [-20, -20],
      [20, 20],
    ] as LatLngBoundsLiteral,
    colorGradient: ['#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252'],
    colorGradientTriggered: [
      '#E3D5F3',
      '#D1B6F0',
      '#BD94EC',
      '#A16AE1',
      '#792CD3',
    ],
    defaultColor: '#969696',
    noDataColor: '#fcf2d4',
    transparentColor: 'transparent',
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  private popoverTexts: { [key: string]: string } = {};
  private country: Country;
  private disasterType: DisasterType;
  private placeCode: PlaceCode;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private translateService: TranslateService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.adminLevelService
      .getAdminLevelSubscription()
      .subscribe(this.onAdminLevelChange);

    this.timelineService
      .getTimelineSubscription()
      .subscribe(this.onLeadTimeChange);

    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.translateService
      .get('map-service.popover')
      .subscribe(this.onTranslate);
  }

  private onCountryChange = (country: Country): void => {
    this.country = country;
    this.loadCountryLayers();
  };

  private onAdminLevelChange = () => {
    this.layers.forEach((layer) => {
      this.hideLayer(layer);
    });
    this.loadCountryLayers();
  };

  private onLeadTimeChange = () => {
    this.loadCountryLayers();
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    if (disasterType) {
      this.disasterType = disasterType;
      this.layers.forEach((layer) => {
        this.hideLayer(layer);
      });
      this.layers
        .filter((layer) => layer.group === IbfLayerGroup.adminRegions)
        .forEach(this.deactivateLayer);
      this.loadCountryLayers();
    }
  };

  private onPlaceCodeChange = (placeCode: PlaceCode): void => {
    this.placeCode = placeCode;
  };

  private onTranslate = (
    translatedStrings: { [key: string]: string } = {},
  ): void => {
    this.popoverTexts = translatedStrings;
  };

  private getPopoverText(indicatorName: IbfLayerName): string {
    let popoverText = '';
    if (this.popoverTexts[indicatorName]) {
      const countryCodeToUse = this.popoverTexts[indicatorName][
        this.country.countryCodeISO3
      ]
        ? this.country.countryCodeISO3
        : 'UGA';
      popoverText = this.popoverTexts[indicatorName][countryCodeToUse];
    }
    return popoverText;
  }

  private onLayerChange = (layers: IbfLayerMetadata[]): void => {
    layers.forEach((layer: IbfLayerMetadata) => {
      let layerActive: boolean;
      if (layer.active === LayerActivation.yes) {
        layerActive = true;
      } else if (
        layer.active === LayerActivation.ifTrigger &&
        this.eventService.state.activeTrigger
      ) {
        layerActive = true;
      } else {
        layerActive = false;
      }
      if (layer.type === IbfLayerType.wms) {
        this.loadWmsLayer(
          layer.name,
          layer.label,
          layerActive,
          layer.leadTimeDependent ? this.timelineService.activeLeadTime : null,
          layer.legendColor,
        );
      } else if (layer.name === IbfLayerName.adminRegions1) {
        this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel1);
      } else if (layer.name === IbfLayerName.adminRegions2) {
        this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel2);
      } else if (layer.name === IbfLayerName.adminRegions3) {
        this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel3);
      } else if (layer.name === IbfLayerName.adminRegions4) {
        this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel4);
      } else if (layer.name === IbfLayerName.glofasStations) {
        this.loadStationLayer(layerActive);
      } else if (layer.name === IbfLayerName.typhoonTrack) {
        this.loadTyphoonTrackLayer(layerActive);
      } else if (layer.name === IbfLayerName.redCrossBranches) {
        this.loadRedCrossBranchesLayer(layer.label, layerActive);
      } else if (layer.name === IbfLayerName.redCrescentBranches) {
        this.loadRedCrossBranchesLayer(layer.label, layerActive);
      } else if (layer.name === IbfLayerName.waterpoints) {
        this.loadWaterPointsLayer(layerActive);
      } else if (layer.name === IbfLayerName.healthSites) {
        this.loadHealthSites(layerActive);
      } else if (layer.name === IbfLayerName.damSites) {
        this.loadDamSites(layerActive);
      }
    });
  };

  private async loadCountryLayers() {
    if (this.country && this.disasterType) {
      this.apiService
        .getLayers(this.country.countryCodeISO3, this.disasterType.disasterType)
        .subscribe(this.onLayerChange);
    }
  }

  private loadStationLayer(layerActive: boolean) {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getStations(
            this.country.countryCodeISO3,
            this.timelineService.activeLeadTime,
          )
          .subscribe(this.addStationLayer);
      } else {
        this.addStationLayer(null);
      }
    }
  }

  private addStationLayer = (stations: any) => {
    this.addLayer({
      name: IbfLayerName.glofasStations,
      label: IbfLayerLabel.glofasStations,
      type: IbfLayerType.point,
      description: this.getPopoverText(IbfLayerName.glofasStations),
      active: this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(
            IbfLayerName.glofasStations,
          )
        : true,
      show: true,
      data: stations,
      viewCenter: false,
      order: 0,
    });
  };

  private loadTyphoonTrackLayer(layerActive: boolean) {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getTyphoonTrack(
            this.country.countryCodeISO3,
            this.timelineService.activeLeadTime,
            this.eventService.state.event?.eventName,
          )
          .subscribe(this.addTyphoonTrackLayer);
      } else {
        this.addTyphoonTrackLayer(null);
      }
    }
  }

  private addTyphoonTrackLayer = (typhoonTrack: any) => {
    this.addLayer({
      name: IbfLayerName.typhoonTrack,
      label: IbfLayerLabel.typhoonTrack,
      type: IbfLayerType.point,
      description: this.getPopoverText(IbfLayerName.typhoonTrack),
      active: this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(
            IbfLayerName.typhoonTrack,
          )
        : true,
      show: true,
      data: typhoonTrack,
      viewCenter: false,
      order: 0,
    });
  };

  private loadRedCrossBranchesLayer = (
    label: IbfLayerLabel,
    layerActive: boolean,
  ) => {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getRedCrossBranches(this.country.countryCodeISO3)
          .subscribe((redCrossBranches) => {
            this.addRedCrossBranchesLayer(label, redCrossBranches);
          });
      } else {
        this.addRedCrossBranchesLayer(label, null);
      }
    }
  };

  private addRedCrossBranchesLayer = (
    label: IbfLayerLabel,
    redCrossBranches: any,
  ) => {
    this.addLayer({
      name: IbfLayerName.redCrossBranches,
      label,
      type: IbfLayerType.point,
      description: this.getPopoverText(IbfLayerName.redCrossBranches),
      active: this.adminLevelService.activeLayerNames.includes(
        IbfLayerName.redCrossBranches,
      ),
      show: true,
      data: redCrossBranches,
      viewCenter: false,
      order: 1,
    });
  };

  private loadDamSites = (layerActive: boolean) => {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getDamSites(this.country.countryCodeISO3)
          .subscribe((damSites) => {
            this.addDamSites(damSites);
          });
      } else {
        this.addDamSites(null);
      }
    }
  };

  private addDamSites = (damSites: any) => {
    this.addLayer({
      name: IbfLayerName.damSites,
      label: IbfLayerLabel.damSites,
      type: IbfLayerType.point,
      description: this.getPopoverText(IbfLayerName.damSites),
      active: this.adminLevelService.activeLayerNames.includes(
        IbfLayerName.damSites,
      ),
      show: true,
      data: damSites,
      viewCenter: false,
      order: 1,
    });
  };

  private loadHealthSites = (layerActive: boolean) => {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getHealthSites(this.country.countryCodeISO3)
          .subscribe((healthSites) => {
            this.addHealthSites(healthSites);
          });
      } else {
        this.addHealthSites(null);
      }
    }
  };

  private addHealthSites = (healthSites: any) => {
    this.addLayer({
      name: IbfLayerName.healthSites,
      label: IbfLayerLabel.healthSites,
      type: IbfLayerType.point,
      description: this.getPopoverText(IbfLayerName.healthSites),
      active: this.adminLevelService.activeLayerNames.includes(
        IbfLayerName.healthSites,
      ),
      show: true,
      data: healthSites,
      viewCenter: false,
      order: 1,
    });
  };

  private loadWaterPointsLayer = (layerActive: boolean) => {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getWaterPoints(this.country.countryCodeISO3)
          .subscribe((waterPoints) => {
            this.addWaterPointsLayer(waterPoints);
          });
      } else {
        this.addWaterPointsLayer(null);
      }
    }
  };

  private addWaterPointsLayer(waterPoints: any) {
    this.addLayer({
      name: IbfLayerName.waterpoints,
      label: IbfLayerLabel.waterpoints,
      type: IbfLayerType.point,
      description: this.getPopoverText(IbfLayerName.waterpoints),
      active: this.adminLevelService.activeLayerNames.includes(
        IbfLayerName.waterpoints,
      ),
      show: true,
      data: waterPoints,
      viewCenter: false,
      order: 2,
    });
  }

  private leadTimeMatchesDisaster = (
    leadTime: LeadTime,
    disasterType: DisasterType,
  ) => {
    return disasterType.leadTimes.map((l) => l.leadTimeName).includes(leadTime);
  };

  private loadAdminRegionLayer(layerActive: boolean, adminLevel: AdminLevel) {
    if (
      this.country &&
      this.disasterType &&
      this.leadTimeMatchesDisaster(
        this.timelineService.activeLeadTime,
        this.disasterType,
      )
    ) {
      if (layerActive) {
        this.apiService
          .getAdminRegions(
            this.country.countryCodeISO3,
            this.disasterType.disasterType,
            this.timelineService.activeLeadTime,
            adminLevel,
            this.eventService.state.event?.eventName,
          )
          .subscribe((adminRegions) =>
            this.addAdminRegionLayer(adminRegions, adminLevel),
          );
      } else {
        this.addAdminRegionLayer(null, adminLevel);
      }
    }
  }

  private addAdminRegionLayer(adminRegions: any, adminLevel: AdminLevel) {
    this.addLayer({
      name: `${IbfLayerGroup.adminRegions}${adminLevel}` as IbfLayerName,
      label: `${IbfLayerGroup.adminRegions}${adminLevel}` as IbfLayerLabel,
      group: IbfLayerGroup.adminRegions,
      type: IbfLayerType.shape,
      description: '',
      active: this.adminLevelService.adminLevel === adminLevel,
      show: true,
      data: adminRegions,
      viewCenter: this.adminLevelService.adminLevel === adminLevel,
      colorProperty: this.disasterType.actionsUnit,
      order: 0,
    });
  }

  public loadAggregateLayer(indicator: Indicator) {
    if (this.country) {
      const layerActive = this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(indicator.name)
        : indicator.active;

      if (layerActive && this.timelineService.activeLeadTime) {
        this.getCombineAdminRegionData(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.adminLevelService.adminLevel,
          this.timelineService.activeLeadTime,
          indicator.name,
          this.eventService.state.event?.eventName,
          indicator.dynamic,
        ).subscribe((adminRegions) => {
          this.addAggregateLayer(indicator, adminRegions, layerActive);
        });
      } else {
        this.addAggregateLayer(indicator, null, layerActive);
      }
    }
  }

  public loadOutlineLayer(indicator: Indicator) {
    if (this.country) {
      if (indicator.active && this.timelineService.activeLeadTime) {
        this.getCombineAdminRegionData(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.adminLevelService.adminLevel,
          this.timelineService.activeLeadTime,
          indicator.name,
          this.eventService.state.event?.eventName,
          indicator.dynamic,
        ).subscribe((adminRegions) => {
          this.addOutlineLayer(indicator, adminRegions);
        });
      } else {
        this.addOutlineLayer(indicator, null);
      }
    }
  }

  private addAggregateLayer(
    indicator: Indicator,
    adminRegions: any,
    active: boolean,
  ) {
    this.addLayer({
      name: indicator.name,
      label: indicator.label,
      type: IbfLayerType.shape,
      description: this.getPopoverText(indicator.name),
      active,
      show: true,
      data: adminRegions,
      viewCenter: true,
      colorProperty: indicator.name,
      colorBreaks: indicator.colorBreaks,
      numberFormatMap: indicator.numberFormatMap,
      legendColor: '#969696',
      group: IbfLayerGroup.aggregates,
      order: 20 + indicator.order,
      dynamic: indicator.dynamic,
      unit: indicator.unit,
    });
  }

  private addOutlineLayer(indicator: Indicator, adminRegions: any) {
    this.addLayer({
      name: indicator.name,
      label: indicator.label,
      type: IbfLayerType.shape,
      description: this.getPopoverText(indicator.name),
      active: indicator.active,
      show: true,
      data: adminRegions,
      viewCenter: true,
      colorProperty: indicator.name,
      colorBreaks: indicator.colorBreaks,
      numberFormatMap: indicator.numberFormatMap,
      legendColor: '#969696',
      group: IbfLayerGroup.outline,
      order: 20 + indicator.order,
      dynamic: indicator.dynamic,
      unit: indicator.unit,
    });
  }

  private filterAggregateLayers = (layer: IbfLayer): boolean =>
    layer.group === IbfLayerGroup.aggregates;

  public hideAggregateLayers = (): void => {
    this.layers.filter(this.filterAggregateLayers).forEach(this.hideLayer);
  };

  private loadWmsLayer(
    layerName: IbfLayerName,
    layerLabel: IbfLayerLabel,
    active: boolean,
    leadTime?: LeadTime,
    legendColor?: string,
  ) {
    if (this.country) {
      this.addLayer({
        name: layerName,
        label: layerLabel,
        type: IbfLayerType.wms,
        description: this.getPopoverText(layerName),
        active,
        show: true,
        viewCenter: false,
        data: null,
        legendColor,
        order: 10,
        wms: {
          url: environment.geoserverUrl,
          name: `ibf-system:${layerName}_${leadTime ? leadTime + '_' : ''}${
            this.country.countryCodeISO3
          }`,
          format: 'image/png',
          version: '1.1.0',
          attribution: '510 Global',
          crs: CRS.EPSG4326,
          transparent: true,
        } as IbfLayerWMS,
      });
    }
  }

  private addLayer(layer: IbfLayer): void {
    const { name, viewCenter, data } = layer;
    if (viewCenter && data && data.features && data.features.length) {
      const layerBounds = bbox(data);
      this.state.bounds = containsNumber(layerBounds)
        ? ([
            [layerBounds[1], layerBounds[0]],
            [layerBounds[3], layerBounds[2]],
          ] as LatLngBoundsLiteral)
        : this.state.bounds;
    }
    this.layerSubject.next(layer);
    const layerIndex = this.getLayerIndexByName(name);
    if (layerIndex >= 0) {
      this.layers.splice(layerIndex, 1, layer);
    } else {
      this.layers.push(layer);
    }
  }

  getLayerSubscription(): Observable<IbfLayer> {
    return this.layerSubject.asObservable();
  }

  private getLayerIndexByName = (name: IbfLayerName): number =>
    this.layers.findIndex((layer: IbfLayer) => layer.name === name);

  public getLayerByName = (layerName: IbfLayerName): IbfLayer =>
    this.layers[this.getLayerIndexByName(layerName)];

  private isLayerActive = (
    layer: IbfLayer,
    interactedLayer: IbfLayer,
  ): boolean => {
    if (layer.group === IbfLayerGroup.outline) {
      return true;
    }
    const isActiveDefined = interactedLayer.active != null;
    const isInteractedLayer = layer.name === interactedLayer.name;
    const isInteractedLayerGroup = layer.group === interactedLayer.group;

    let isActive = layer.active;

    if (isActiveDefined && isInteractedLayerGroup) {
      if (isInteractedLayer) {
        isActive = interactedLayer.active;
      } else {
        if (layer.group) {
          isActive = false;
        }
      }
    }

    return isActive;
  };

  private isLayerShown = (
    layer: IbfLayer,
    interactedLayer: IbfLayer,
  ): boolean => {
    return interactedLayer.show == null || layer.name !== interactedLayer.name
      ? layer.show
      : interactedLayer.show;
  };

  private checkAdminLevelMatchesDisasterType(layer: IbfLayer): boolean {
    if (layer.group !== IbfLayerGroup.adminRegions) {
      return true;
    }
    const adminLevel = Number(
      layer.name.substr(layer.name.length - 1),
    ) as AdminLevel;
    if (
      this.country.countryDisasterSettings
        .find((s) => s.disasterType === this.disasterType.disasterType)
        .adminLevels.includes(adminLevel)
    ) {
      return true;
    } else {
      return false;
    }
  }

  private updateLayer = (layer: IbfLayer) => (layerData) => {
    if (!this.checkAdminLevelMatchesDisasterType(layer)) {
      return;
    }
    this.addLayer({
      name: layer.name,
      label: layer.label,
      type: layer.type,
      description: layer.description,
      active: this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(layer.name)
        : layer.active,
      viewCenter: false,
      data: layerData,
      wms: layer.wms,
      colorProperty:
        layer.group === IbfLayerGroup.adminRegions
          ? this.disasterType.actionsUnit
          : layer.colorProperty,
      colorBreaks: layer.colorBreaks,
      numberFormatMap: layer.numberFormatMap,
      legendColor: layer.legendColor,
      group: layer.group,
      order: layer.order,
      unit: layer.unit,
      dynamic: layer.dynamic,
      show: this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(layer.name)
        : layer.show,
    });
  };

  public toggleLayer = (layer: IbfLayer): void => {
    layer.active = !layer.active;
    this.adminLevelService.activeLayerNames = [];
    this.updateLayers(layer);
  };

  public activateLayer = (layer: IbfLayer): void => {
    layer.active = true;
    this.updateLayers(layer);
  };

  public deactivateLayer = (layer: IbfLayer): void => {
    layer.active = false;
    this.updateLayers(layer);
  };

  public showLayer = (layer: IbfLayer): void => {
    layer.show = true;
    this.updateLayers(layer);
  };

  public hideLayer = (layer: IbfLayer): void => {
    layer.show = false;
    this.updateLayers(layer);
  };

  private updateLayers = (newLayer: IbfLayer): void => {
    this.layers.forEach((layer: IbfLayer): void => {
      let layerObservable: Observable<GeoJSON.FeatureCollection> = of({
        type: 'FeatureCollection',
        features: [],
      });
      const layerDataCacheKey = `${this.country.countryCodeISO3}_${this.disasterType.disasterType}_${this.timelineService.activeLeadTime}_${this.adminLevelService.adminLevel}_${layer.name}`;
      layer.active = this.isLayerActive(layer, newLayer);
      layer.show = this.isLayerShown(layer, newLayer);
      if (this.layerDataCache[layerDataCacheKey]) {
        layerObservable = this.layerDataCache[layerDataCacheKey];
      } else if (layer.active) {
        layerObservable = this.getLayerData(layer, layerDataCacheKey);
      }
      layerObservable.subscribe(this.updateLayer(layer));
    });
  };

  private getLayerData = (
    layer: IbfLayer,
    layerDataCacheKey: string,
  ): Observable<GeoJSON.FeatureCollection> => {
    let layerData: Observable<GeoJSON.FeatureCollection>;
    if (layer.name === IbfLayerName.waterpoints) {
      layerData = this.apiService
        .getWaterPoints(this.country.countryCodeISO3)
        .pipe(shareReplay(1));
    } else if (
      layer.name === IbfLayerName.redCrossBranches ||
      layer.name === IbfLayerName.redCrescentBranches
    ) {
      layerData = this.apiService
        .getRedCrossBranches(this.country.countryCodeISO3)
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.healthSites) {
      layerData = this.apiService
        .getHealthSites(this.country.countryCodeISO3)
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.damSites) {
      layerData = this.apiService
        .getDamSites(this.country.countryCodeISO3)
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.glofasStations) {
      layerData = this.apiService
        .getStations(
          this.country.countryCodeISO3,
          this.timelineService.activeLeadTime,
        )
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.typhoonTrack) {
      layerData = this.apiService
        .getTyphoonTrack(
          this.country.countryCodeISO3,
          this.timelineService.activeLeadTime,
          this.eventService.state.event?.eventName,
        )
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.adminRegions) {
      layerData = this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineService.activeLeadTime,
          this.adminLevelService.adminLevel,
          this.eventService.state.event?.eventName,
        )
        .pipe(shareReplay(1));
    } else if (layer.group === IbfLayerGroup.adminRegions) {
      const adminLevel = Number(
        layer.name.substr(layer.name.length - 1),
      ) as AdminLevel;
      layerData = this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineService.activeLeadTime,
          adminLevel,
          this.eventService.state.event?.eventName,
        )
        .pipe(shareReplay(1));
    } else if (
      layer.group === IbfLayerGroup.aggregates ||
      layer.group === IbfLayerGroup.outline
    ) {
      layerData = this.getCombineAdminRegionData(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
        this.adminLevelService.adminLevel,
        this.timelineService.activeLeadTime,
        layer.name,
        this.eventService.state.event?.eventName,
        layer.dynamic,
      ).pipe(shareReplay(1));
    } else {
      layerData = of(null);
    }
    this.layerDataCache[layerDataCacheKey] = layerData;
    return layerData;
  };

  getCombineAdminRegionData(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    adminLevel: AdminLevel,
    leadTime: LeadTime,
    layerName: IbfLayerName,
    eventName: string,
    dynamic: boolean,
  ): Observable<GeoJSON.FeatureCollection> {
    // Do api request to get data layer
    let admDynamicDataObs: Observable<any>;
    if (dynamic) {
      admDynamicDataObs = this.apiService.getAdminAreaDynamicData(
        countryCodeISO3,
        adminLevel,
        leadTime,
        layerName,
        disasterType,
        eventName,
      );
    } else {
      admDynamicDataObs = this.apiService.getAdminAreaData(
        countryCodeISO3,
        adminLevel,
        layerName,
      );
    }
    // Get the geometry from the admin region (this should re-use the cache if that is already loaded)
    const adminRegionsLayer = new IbfLayer();
    adminRegionsLayer.name = IbfLayerName.adminRegions;
    const layerDataCacheKey = `${this.country.countryCodeISO3}_${this.timelineService.activeLeadTime}_${this.adminLevelService.adminLevel}_${adminRegionsLayer.name}`;
    const adminRegionsObs = this.getLayerData(
      adminRegionsLayer,
      layerDataCacheKey,
    );

    // Combine results
    return zip(admDynamicDataObs, adminRegionsObs).pipe(
      map(([admDynamicData, adminRegions]) => {
        const updatedFeatures = [];
        for (const area of adminRegions.features) {
          const foundAdmDynamicEntry = admDynamicData.find(
            (admDynamicEntry): number => {
              if (area.properties.placeCode === admDynamicEntry.placeCode) {
                return admDynamicEntry;
              }
            },
          );
          area.properties.indicators = {};
          area.properties.indicators[layerName] = foundAdmDynamicEntry
            ? foundAdmDynamicEntry.value
            : null;
          updatedFeatures.push(area);
        }
        return adminRegions;
      }),
    );
  }

  getAdminRegionFillColor = (
    colorPropertyValue,
    colorThreshold,
    placeCode: string,
  ): string => {
    let adminRegionFillColor = this.state.defaultColor;
    const currentColorGradient = this.disasterType?.activeTrigger
      ? this.state.colorGradientTriggered
      : this.state.colorGradient;

    switch (true) {
      case colorPropertyValue === null:
        adminRegionFillColor = this.state.noDataColor;
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break1]:
        adminRegionFillColor = currentColorGradient[0];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break2]:
        adminRegionFillColor = currentColorGradient[1];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break3]:
        adminRegionFillColor = currentColorGradient[2];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break4]:
        adminRegionFillColor = currentColorGradient[3];
        break;
      case colorPropertyValue > colorThreshold[breakKey.break4]:
        adminRegionFillColor = currentColorGradient[4];
        break;
      default:
        adminRegionFillColor = this.state.defaultColor;
    }
    if (this.placeCode && this.placeCode.placeCode === placeCode) {
      adminRegionFillColor = this.eventService.state.activeTrigger
        ? this.alertColor
        : this.safeColor;
    }

    return adminRegionFillColor;
  };

  getOutlineColor(colorPropertyValue) {
    switch (true) {
      case colorPropertyValue === 0:
        return 0;
      default:
        return 1;
    }
  }

  getAdminRegionFillOpacity = (layer: IbfLayer, placeCode: string): number => {
    let fillOpacity = this.state.defaultFillOpacity;
    let unselectedFillOpacity = this.unselectedFillOpacity;
    const hoverFillOpacity = this.hoverFillOpacity;

    if (layer.group === IbfLayerGroup.adminRegions) {
      fillOpacity = 0.0;
      unselectedFillOpacity = 0.0;
    }

    if (
      this.country &&
      this.country.countryCodeISO3 === 'EGY' &&
      !placeCode.includes('EG')
    ) {
      fillOpacity = 0.0;
    }

    if (this.placeCode) {
      if (this.placeCode.placeCode === placeCode) {
        fillOpacity = hoverFillOpacity;
      } else {
        fillOpacity = unselectedFillOpacity;
      }
    }

    return fillOpacity;
  };

  getAdminRegionWeight = (layer: IbfLayer): number => {
    return layer.name === IbfLayerName.adminRegions
      ? this.state.defaultWeight
      : layer.group === IbfLayerGroup.adminRegions
      ? this.adminLevelLowerThanDefault(layer.name)
        ? 3
        : 0.33
      : this.state.defaultWeight;
  };

  adminLevelLowerThanDefault = (name: IbfLayerName): boolean => {
    return (
      name.substr(name.length - 1) < String(this.adminLevelService.adminLevel)
    );
  };

  getAdminRegionColor = (layer: IbfLayer): string => {
    return layer.group === IbfLayerGroup.adminRegions
      ? this.state.defaultColor
      : this.state.transparentColor;
  };

  public getColorThreshold = (adminRegions, colorProperty, colorBreaks) => {
    if (colorBreaks) {
      return {
        break0: 0,
        break1: colorBreaks['1'].valueHigh,
        break2: colorBreaks['2'].valueHigh,
        break3: colorBreaks['3'].valueHigh,
        break4: colorBreaks['4'].valueHigh,
      };
    }
    const colorPropertyValues = adminRegions.features
      .map((feature) =>
        typeof feature.properties[colorProperty] !== 'undefined'
          ? feature.properties[colorProperty]
          : feature.properties.indicators &&
            feature.properties.indicators[colorProperty],
      )
      .filter((v, i, a) => a.indexOf(v) === i);

    const colorThreshold = {
      break0: quantile(colorPropertyValues, 0.0),
      break1: quantile(colorPropertyValues, 0.2),
      break2: quantile(colorPropertyValues, 0.4),
      break3: quantile(colorPropertyValues, 0.6),
      break4: quantile(colorPropertyValues, 0.8),
    };
    return colorThreshold;
  };

  public setOutlineLayerStyle = (layer: IbfLayer) => {
    const colorProperty = layer.colorProperty;
    return (adminRegion) => {
      const color = 'var(--ion-color-ibf-outline-red)';
      const opacity = this.getOutlineColor(
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : adminRegion.properties.indicators[colorProperty],
      );
      const fillOpacity = 0;
      const weight = 3;
      return {
        opacity,
        color,
        fillOpacity,
        weight,
      };
    };
  };

  public setAdminRegionStyle = (layer: IbfLayer) => {
    const colorProperty = layer.colorProperty;
    const colorThreshold = this.getColorThreshold(
      layer.data,
      colorProperty,
      layer.colorBreaks,
    );

    return (adminRegion) => {
      const fillColor = this.getAdminRegionFillColor(
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : adminRegion.properties.indicators[colorProperty],
        colorThreshold,
        adminRegion.properties.placeCode,
      );
      const fillOpacity = this.getAdminRegionFillOpacity(
        layer,
        adminRegion.properties.placeCode,
      );
      let weight = this.getAdminRegionWeight(layer);
      let color = this.getAdminRegionColor(layer);
      let dashArray;
      if (adminRegion.properties.placeCode.includes('Disputed')) {
        dashArray = this.disputedBorderStyle.dashArray;
        weight = this.disputedBorderStyle.weight;
        color = this.disputedBorderStyle.color;
      }
      return {
        fillColor,
        fillOpacity,
        weight,
        color,
        dashArray,
      };
    };
  };
}
