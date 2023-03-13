import { Injectable } from '@angular/core';
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
import { EventState } from '../types/event-state';
import { TimelineState } from '../types/timeline-state';
import { DisasterTypeService } from './disaster-type.service';
import { EapActionsService } from './eap-actions.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private layerSubject = new BehaviorSubject<IbfLayer>(null);
  public layers = [] as IbfLayer[];
  public selectedOutlineColor = {
    triggered: '#737373',
    nonTriggered: 'var(--ion-color-ibf-no-alert-primary)',
  };
  private stoppedTriggerColor = 'var(--ion-color-ibf-black)';
  private triggeredAreaColor = 'var(--ion-color-ibf-outline-red)';
  private disputedBorderStyle = {
    weight: 2,
    dashArray: '5 5',
    color: null,
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

  public eventState: EventState;
  public timelineState: TimelineState;
  public adminLevel: AdminLevel;
  public triggeredAreas: any[];

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
    private disasterTypeService: DisasterTypeService,
    private eapActionsService: EapActionsService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.adminLevelService
      .getAdminLevelSubscription()
      .subscribe(this.onAdminLevelChange);

    this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);

    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.eapActionsService
      .getTriggeredAreas()
      .subscribe(this.onTriggeredAreasChange);
  }

  private onCountryChange = (country: Country): void => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
  };

  private onAdminLevelChange = (adminLevel: AdminLevel) => {
    this.adminLevel = adminLevel;
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
  };

  private onEventStateChange = (eventState: any) => {
    this.eventState = eventState;
  };

  private onTriggeredAreasChange = (triggeredAreas: any[]) => {
    this.triggeredAreas = triggeredAreas;
    this.loadLayers();
  };

  private onPlaceCodeChange = (placeCode: PlaceCode): void => {
    this.placeCode = placeCode;
  };

  private getPopoverText(indicator: IbfLayerMetadata | Indicator): string {
    if (
      indicator.description &&
      indicator.description[this.country.countryCodeISO3] &&
      indicator.description[this.country.countryCodeISO3][
        this.disasterType.disasterType
      ]
    ) {
      return indicator.description[this.country.countryCodeISO3][
        this.disasterType.disasterType
      ];
    }
    return '';
  }

  private onLayerChange = (layers: IbfLayerMetadata[]): void => {
    layers.forEach((layer: IbfLayerMetadata) => {
      const layerActive = this.getActiveState(layer);

      if (layer.type === IbfLayerType.wms) {
        this.loadWmsLayer(
          layer,
          layerActive,
          layer.leadTimeDependent ? this.timelineState.activeLeadTime : null,
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
        this.loadStationLayer(layer, layerActive);
      } else if (layer.name === IbfLayerName.typhoonTrack) {
        this.loadTyphoonTrackLayer(layer, layerActive);
      } else if (layer.name === IbfLayerName.waterpoints) {
        this.loadWaterPointsLayer(layer, layerActive);
      } else if (layer.type === IbfLayerType.point) {
        // NOTE: any non-standard point layers should be placed above this 'else if'!
        this.loadPointDataLayer(layer, layerActive);
      }
    });
  };

  private async loadLayers() {
    this.layers = [];
    this.layerSubject.next(null);

    if (
      this.country &&
      this.disasterType &&
      this.eventState &&
      this.timelineState &&
      this.adminLevel
    ) {
      this.apiService
        .getLayers(this.country.countryCodeISO3, this.disasterType.disasterType)
        .subscribe(this.onLayerChange);
    }
  }

  private loadStationLayer(layer: IbfLayerMetadata, layerActive: boolean) {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getStations(
            this.country.countryCodeISO3,
            this.timelineState.activeLeadTime,
          )
          .subscribe((stationData) => this.addStationLayer(layer, stationData));
      } else {
        this.addStationLayer(layer, null);
      }
    }
  }

  private addStationLayer = (layer: IbfLayerMetadata, stations: any) => {
    this.addLayer({
      name: IbfLayerName.glofasStations,
      label: IbfLayerLabel.glofasStations,
      type: IbfLayerType.point,
      description: this.getPopoverText(layer),
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

  private loadTyphoonTrackLayer(layer: IbfLayerMetadata, layerActive: boolean) {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getTyphoonTrack(
            this.country.countryCodeISO3,
            this.eventState?.event?.eventName,
          )
          .subscribe((trackData) =>
            this.addTyphoonTrackLayer(layer, trackData),
          );
      } else {
        this.addTyphoonTrackLayer(layer, null);
      }
    }
  }

  private addTyphoonTrackLayer = (
    layer: IbfLayerMetadata,
    typhoonTrack: any,
  ) => {
    this.addLayer({
      name: IbfLayerName.typhoonTrack,
      label: IbfLayerLabel.typhoonTrack,
      type: IbfLayerType.point,
      description: this.getPopoverText(layer),
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

  private loadPointDataLayer = (
    layer: IbfLayerMetadata,
    layerActive: boolean,
  ) => {
    const layerName =
      layer.name === IbfLayerName.redCrescentBranches
        ? IbfLayerName.redCrossBranches
        : layer.name;
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getPointData(this.country.countryCodeISO3, layerName)
          .subscribe((pointData) => {
            this.addPointDataLayer(layer, layerName, pointData);
          });
      } else {
        this.addPointDataLayer(layer, layerName, null);
      }
    }
  };

  private addPointDataLayer = (
    layer: IbfLayerMetadata,
    layerName: IbfLayerName,
    pointData: any,
  ) => {
    this.addLayer({
      name: layerName,
      label: layer.label,
      type: IbfLayerType.point,
      description: this.getPopoverText(layer),
      active: this.adminLevelService.activeLayerNames.includes(layerName),
      show: true,
      data: pointData,
      viewCenter: false,
      order: 1,
    });
  };

  private loadWaterPointsLayer = (
    layer: IbfLayerMetadata,
    layerActive: boolean,
  ) => {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getWaterPoints(this.country.countryCodeISO3)
          .subscribe((waterPoints) => {
            this.addWaterPointsLayer(layer, waterPoints);
          });
      } else {
        this.addWaterPointsLayer(layer, null);
      }
    }
  };

  private addWaterPointsLayer(layer: IbfLayerMetadata, waterPoints: any) {
    this.addLayer({
      name: IbfLayerName.waterpoints,
      label: IbfLayerLabel.waterpoints,
      type: IbfLayerType.point,
      description: this.getPopoverText(layer),
      active: this.adminLevelService.activeLayerNames.includes(
        IbfLayerName.waterpoints,
      ),
      show: true,
      data: waterPoints,
      viewCenter: false,
      order: 2,
    });
  }

  private loadAdminRegionLayer(layerActive: boolean, adminLevel: AdminLevel) {
    if (layerActive) {
      this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineState.activeLeadTime,
          adminLevel,
          this.eventState?.event?.eventName,
        )
        .subscribe((adminRegions) =>
          this.addAdminRegionLayer(adminRegions, adminLevel),
        );
    } else {
      this.addAdminRegionLayer(null, adminLevel);
    }
  }

  private addAdminRegionLayer(adminRegions: any, adminLevel: AdminLevel) {
    this.addLayer({
      name: `${IbfLayerGroup.adminRegions}${adminLevel}` as IbfLayerName,
      label: `${IbfLayerGroup.adminRegions}${adminLevel}` as IbfLayerLabel,
      group: IbfLayerGroup.adminRegions,
      type: IbfLayerType.shape,
      description: '',
      active: this.adminLevel === adminLevel,
      show: true,
      data: adminRegions,
      viewCenter: this.adminLevel === adminLevel,
      colorProperty: this.disasterType.actionsUnit,
      order: 0,
    });
  }

  public loadAggregateLayer(indicator: Indicator) {
    if (this.country) {
      const layerActive = this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(indicator.name)
        : this.getActiveState(indicator);

      if (layerActive && this.timelineState) {
        this.getCombineAdminRegionData(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.adminLevel,
          indicator.name,
          indicator.dynamic,
          this.timelineState.activeLeadTime,
          this.eventState?.event?.eventName,
        ).subscribe((adminRegions) => {
          this.addAggregateLayer(indicator, adminRegions, layerActive);
        });
      } else {
        this.addAggregateLayer(indicator, null, layerActive);
      }
    }
  }

  private getActiveState(indicatorOrLayer: Indicator | IbfLayerMetadata) {
    return indicatorOrLayer.active === LayerActivation.yes
      ? true
      : indicatorOrLayer.active === LayerActivation.ifTrigger &&
        this.eventState?.activeTrigger
      ? true
      : false;
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
      description: this.getPopoverText(indicator),
      active,
      show: true,
      data: adminRegions,
      viewCenter: true,
      colorProperty: indicator.name,
      colorBreaks: indicator.colorBreaks,
      numberFormatMap: indicator.numberFormatMap,
      legendColor:
        this.eventState.activeTrigger && this.eventState.thresholdReached
          ? this.state.colorGradientTriggered[2]
          : this.state.colorGradient[2],
      group:
        indicator.name === IbfLayerName.alertThreshold
          ? IbfLayerGroup.outline
          : IbfLayerGroup.aggregates,
      order: 20 + indicator.order,
      dynamic: indicator.dynamic,
      unit: indicator.unit,
    });
  }

  private filterNonAggregateLayers = (layer: IbfLayer): boolean =>
    layer.group !== IbfLayerGroup.aggregates &&
    layer.group !== IbfLayerGroup.outline;

  public removeAggregateLayers = (): void => {
    this.layers = this.layers.filter(this.filterNonAggregateLayers);
  };

  private loadWmsLayer(
    layer: IbfLayerMetadata,
    active: boolean,
    leadTime?: LeadTime,
  ) {
    if (this.country) {
      this.addLayer({
        name: layer.name,
        label: layer.label,
        type: IbfLayerType.wms,
        description: this.getPopoverText(layer),
        active,
        show: true,
        viewCenter: false,
        data: null,
        legendColor: layer.legendColor,
        order: 10,
        wms: {
          url: environment.geoserverUrl,
          name: `ibf-system:${layer.name}_${leadTime ? leadTime + '_' : ''}${
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

  private updateLayer = (layer: IbfLayer) => (layerData) => {
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
      show: layer.show,
    });
  };

  public toggleLayer = (layer: IbfLayer): void => {
    layer.active = !layer.active;
    this.adminLevelService.activeLayerNames = [];
    this.updateLayers(layer);
  };

  private updateLayers = (newLayer: IbfLayer): void => {
    this.layers.forEach((layer: IbfLayer): void => {
      let layerObservable: Observable<GeoJSON.FeatureCollection> = of({
        type: 'FeatureCollection',
        features: [],
      });
      const layerDataCacheKey = `${this.country.countryCodeISO3}_${this.disasterType.disasterType}_${this.timelineState.activeLeadTime}_${this.adminLevel}_${layer.name}`;
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
    } else if (layer.name === IbfLayerName.glofasStations) {
      layerData = this.apiService
        .getStations(
          this.country.countryCodeISO3,
          this.timelineState.activeLeadTime,
        )
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.typhoonTrack) {
      layerData = this.apiService
        .getTyphoonTrack(
          this.country.countryCodeISO3,
          this.eventState?.event?.eventName,
        )
        .pipe(shareReplay(1));
    } else if (layer.type === IbfLayerType.point) {
      // NOTE: any non-standard point layers should be placed above this 'else if'!
      const layerName =
        layer.name === IbfLayerName.redCrescentBranches
          ? IbfLayerName.redCrossBranches
          : layer.name;
      layerData = this.apiService
        .getPointData(this.country.countryCodeISO3, layerName)
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.adminRegions) {
      layerData = this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineState.activeLeadTime,
          this.adminLevel,
          this.eventState?.event?.eventName,
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
          this.timelineState.activeLeadTime,
          adminLevel,
          this.eventState?.event?.eventName,
        )
        .pipe(shareReplay(1));
    } else if (
      layer.group === IbfLayerGroup.aggregates ||
      layer.group === IbfLayerGroup.outline
    ) {
      layerData = this.getCombineAdminRegionData(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
        this.adminLevel,
        layer.name,
        layer.dynamic,
        this.timelineState.activeLeadTime,
        this.eventState?.event?.eventName,
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
    layerName: IbfLayerName,
    dynamic: boolean,
    leadTime: LeadTime,
    eventName: string,
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
    const layerDataCacheKey = `${this.country.countryCodeISO3}_${this.disasterType.disasterType}_${this.timelineState.activeLeadTime}_${this.adminLevel}_${adminRegionsLayer.name}`;
    const adminRegionsObs = this.getLayerData(
      adminRegionsLayer,
      layerDataCacheKey,
    );

    // Combine results
    return zip(admDynamicDataObs, adminRegionsObs).pipe(
      map(([admDynamicData, adminRegions]) => {
        const updatedFeatures = [];
        for (const area of adminRegions?.features || []) {
          const foundAdmDynamicEntry = admDynamicData.find(
            (admDynamicEntry): number => {
              if (area.properties?.placeCode === admDynamicEntry.placeCode) {
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
    const currentColorGradient =
      this.eventState.activeTrigger && this.eventState.thresholdReached
        ? this.state.colorGradientTriggered
        : this.state.colorGradient;

    const areaState = this.triggeredAreas.find(
      (area) => area.placeCode === placeCode,
    );

    switch (true) {
      case areaState?.stopped:
        adminRegionFillColor = this.state.colorGradient[0];
        break;
      case colorPropertyValue === null:
        adminRegionFillColor = this.state.noDataColor;
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break1] ||
        !colorThreshold[breakKey.break1]:
        adminRegionFillColor = currentColorGradient[0];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break2] ||
        !colorThreshold[breakKey.break2]:
        adminRegionFillColor = currentColorGradient[1];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break3] ||
        !colorThreshold[breakKey.break3]:
        adminRegionFillColor = currentColorGradient[2];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break4] ||
        !colorThreshold[breakKey.break4]:
        adminRegionFillColor = currentColorGradient[3];
        break;
      case colorPropertyValue > colorThreshold[breakKey.break4]:
        adminRegionFillColor = currentColorGradient[4];
        break;
      default:
        adminRegionFillColor = this.state.defaultColor;
    }

    return adminRegionFillColor;
  };

  getOutlineOpacity(colorPropertyValue) {
    switch (true) {
      case colorPropertyValue === 0:
        return 0;
      default:
        return 1;
    }
  }

  getAdminRegionFillOpacity = (layer: IbfLayer, placeCode: string): number => {
    let fillOpacity = this.state.defaultFillOpacity;

    if (layer.group === IbfLayerGroup.adminRegions) {
      fillOpacity = 0.0;
    }

    if (
      this.country &&
      this.country.countryCodeISO3 === 'EGY' &&
      !placeCode.includes('EG')
    ) {
      fillOpacity = 0.0;
    }

    return fillOpacity;
  };

  getAdminRegionWeight = (layer: IbfLayer, placeCode: string): number => {
    let weight =
      layer.name === IbfLayerName.adminRegions
        ? this.state.defaultWeight
        : layer.group === IbfLayerGroup.adminRegions
        ? this.adminLevelLowerThanDefault(layer.name)
          ? 3
          : 0.33
        : this.state.defaultWeight;

    if (this.placeCode) {
      const areaState = this.triggeredAreas.find(
        (area) => area.placeCode === placeCode,
      );
      if (this.placeCode.placeCode === placeCode && !areaState) {
        weight = 3; // Give weight of selected non-triggered area of 3 (from nothing)
      }
    }

    return weight;
  };

  adminLevelLowerThanDefault = (name: IbfLayerName): boolean => {
    return name.substr(name.length - 1) < String(this.adminLevel);
  };

  getAdminRegionColor = (layer: IbfLayer, placeCode: string): string => {
    let color =
      layer.group === IbfLayerGroup.adminRegions
        ? this.state.defaultColor
        : this.state.transparentColor;

    if (this.placeCode) {
      const areaState = this.triggeredAreas.find(
        (area) => area.placeCode === placeCode,
      );
      if (this.placeCode.placeCode === placeCode && !areaState) {
        color = this.selectedOutlineColor[
          this.disasterType?.activeTrigger ? 'triggered' : 'nonTriggered'
        ];
      }
    }
    return color;
  };

  public getColorThreshold = (adminRegions, colorProperty, colorBreaks) => {
    if (colorBreaks) {
      const colorThresholdWithBreaks = {
        break0: 0,
      };
      Object.keys(colorBreaks).forEach((colorBreak) => {
        if (colorBreaks[String(Number(colorBreak) + 1)]) {
          colorThresholdWithBreaks[`break${colorBreak}`] =
            colorBreaks[colorBreak].valueHigh;
        }
      });
      return colorThresholdWithBreaks;
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
      const placeCode = adminRegion?.properties?.placeCode;
      const areaState = this.triggeredAreas.find(
        (area) => area.placeCode === placeCode,
      );
      const color = areaState?.stopped
        ? this.stoppedTriggerColor
        : this.triggeredAreaColor;
      const opacity = this.getOutlineOpacity(
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : adminRegion.properties.indicators[colorProperty],
      );
      const fillOpacity = 0;
      let weight = 3;
      if (this.placeCode) {
        if (this.placeCode.placeCode !== placeCode && areaState) {
          weight = 1; // Decrease weight of unselected triggered areas from 3 to 1
        }
      }
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
      const colorPropertyValue =
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : typeof adminRegion.properties.indicators !== 'undefined'
          ? adminRegion.properties.indicators[colorProperty]
          : 'undefined';
      if (colorPropertyValue !== 'undefined') {
        const fillColor = this.getAdminRegionFillColor(
          colorPropertyValue,
          colorThreshold,
          adminRegion.properties.placeCode,
        );
        const fillOpacity = this.getAdminRegionFillOpacity(
          layer,
          adminRegion.properties.placeCode,
        );
        let weight = this.getAdminRegionWeight(
          layer,
          adminRegion.properties.placeCode,
        );
        let color = this.getAdminRegionColor(
          layer,
          adminRegion.properties.placeCode,
        );
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
      }
    };
  };

  public setAdminRegionMouseOverStyle = (placeCode: string) => {
    const areaState = this.triggeredAreas.find(
      (area) => area.placeCode === placeCode,
    );
    if (!areaState) {
      return {
        color: this.selectedOutlineColor[
          this.disasterType?.activeTrigger ? 'triggered' : 'nonTriggered'
        ],
        weight: 3,
      };
    } else if (areaState.stopped) {
      return {
        color: this.stoppedTriggerColor,
        weight: 5,
      };
    } else {
      return {
        color: this.triggeredAreaColor,
        weight: 5,
      };
    }
  };
}
