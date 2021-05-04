import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import { CRS, LatLngBoundsLiteral } from 'leaflet';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
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
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from '../mocks/mock-scenario.enum';
import { Country } from '../models/country.model';
import { LayerActivation } from '../models/layer-activation.enum';
import { breakKey } from '../models/map.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private layerSubject = new BehaviorSubject<IbfLayer>(null);
  public layers = [] as IbfLayer[];
  public activeLayerName: IbfLayerName;
  public alertColor = '#de9584';
  public safeColor = '#2c45fd';
  public hoverFillOpacity = 0.6;
  public unselectedFillOpacity = 0.4;
  public disputedBorderStyle = {
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
    defaultColor: '#969696',
    transparentColor: 'transparent',
    defaultColorProperty: IbfLayerName.population_affected,
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  private popoverTexts: { [key: string]: string } = {};
  private country: Country;
  private placeCode: PlaceCode;
  private mockScenario: MockScenario;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private mockScenarioService: MockScenarioService,
    private translateService: TranslateService,
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

    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe(this.onMockScenarioChange);

    this.translateService
      .get('map-service.popover')
      .subscribe(this.onTranslate);
  }

  private onCountryChange = (country: Country): void => {
    this.country = country;
    this.loadCountryLayers();
  };

  private onAdminLevelChange = () => {
    this.loadAdminRegionLayer(true);
  };

  private onLeadTimeChange = () => {
    this.loadCountryLayers();
  };

  private onPlaceCodeChange = (placeCode: PlaceCode): void => {
    this.placeCode = placeCode;
  };

  private onMockScenarioChange = (mockScenario: MockScenario) => {
    this.mockScenario = mockScenario;
    this.loadCountryLayers();
  };

  private onTranslate = (translatedStrings) => {
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

  private onLayerChange = (layers) => {
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
      } else if (layer.name === IbfLayerName.adminRegions) {
        this.loadAdminRegionLayer(layerActive);
      } else if (layer.name === IbfLayerName.glofasStations) {
        this.loadStationLayer(layerActive);
      } else if (layer.name === IbfLayerName.redCrossBranches) {
        this.loadRedCrossBranchesLayer(layer.label, layerActive);
      } else if (layer.name === IbfLayerName.redCrescentBranches) {
        this.loadRedCrossBranchesLayer(layer.label, layerActive);
      } else if (layer.name === IbfLayerName.waterpoints) {
        this.loadWaterPointsLayer(layerActive);
      } else if (layer.name === IbfLayerName.healthSites) {
        this.loadHealthSites(layerActive);
      }
    });
  };

  public async loadCountryLayers() {
    if (this.country) {
      this.apiService
        .getLayers(this.country.countryCodeISO3)
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
      active: true,
      show: true,
      data: stations,
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
      active: false,
      show: true,
      data: redCrossBranches,
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
            console.log('healthSites: sbuscribe ', healthSites);
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
      active: false,
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
      active: false,
      show: true,
      data: waterPoints,
      viewCenter: false,
      order: 2,
    });
  }

  private loadAdminRegionLayer(layerActive: boolean) {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getAdminRegions(
            this.country.countryCodeISO3,
            this.timelineService.activeLeadTime,
            this.adminLevelService.adminLevel,
          )
          .subscribe((adminRegions) => {
            this.addAdminRegionLayer(adminRegions);
          });
      } else {
        this.addAdminRegionLayer(null);
      }
    }
  }

  private addAdminRegionLayer(adminRegions: any) {
    this.addLayer({
      name: IbfLayerName.adminRegions,
      label: IbfLayerLabel.adminRegions,
      type: IbfLayerType.shape,
      description: '',
      active: true,
      show: true,
      data: adminRegions,
      viewCenter: true,
      colorProperty: this.state.defaultColorProperty,
      order: 0,
    });
  }

  public loadAggregateLayer(indicator: Indicator) {
    if (this.country) {
      if (indicator.active) {
        this.apiService
          .getAdminRegions(
            this.country.countryCodeISO3,
            this.timelineService.activeLeadTime,
            this.adminLevelService.adminLevel,
          )
          .subscribe((adminRegions) => {
            this.addAggregateLayer(indicator, adminRegions);
          });
      } else {
        this.addAggregateLayer(indicator, null);
      }
    }
  }

  public addAggregateLayer(indicator: Indicator, adminRegions: any) {
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
      group: IbfLayerGroup.aggregates,
      order: 20 + indicator.order,
      unit: indicator.unit,
    });
  }

  public hideAggregateLayers() {
    this.layers.forEach((layer: IbfLayer) => {
      if (layer.group === IbfLayerGroup.aggregates) {
        this.updateLayers(layer.name, layer.active, false);
      }
    });
  }

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

  private addLayer(layer: IbfLayer) {
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
    const layerIndex = this.getLayerIndexById(name);
    if (layerIndex >= 0) {
      this.layers.splice(layerIndex, 1, layer);
    } else {
      this.layers.push(layer);
    }
  }

  getLayerSubscription(): Observable<IbfLayer> {
    return this.layerSubject.asObservable();
  }

  private getLayerIndexById(name: IbfLayerName): number {
    return this.layers.findIndex((layer: IbfLayer) => {
      return layer.name === name;
    });
  }

  private isLayerActive(active, layer, interactedLayer) {
    const isActiveDefined = active != null;
    const isInteractedLayer = layer.name === interactedLayer.name;
    const isInteractedLayerGroup = layer.group === interactedLayer.group;

    let isActive = layer.active;

    if (isActiveDefined && isInteractedLayerGroup) {
      if (isInteractedLayer) {
        isActive = active;
      } else {
        if (layer.group) {
          isActive = false;
        }
      }
    }

    return isActive;
  }

  private updateLayer = (
    active: boolean,
    show: boolean,
    layer: IbfLayer,
    interactedLayer: IbfLayer,
  ) => (layerData) => {
    this.addLayer({
      name: layer.name,
      label: layer.label,
      type: layer.type,
      description: layer.description,
      active,
      viewCenter: false,
      data: layerData,
      wms: layer.wms,
      colorProperty: layer.colorProperty,
      colorBreaks: layer.colorBreaks,
      numberFormatMap: layer.numberFormatMap,
      legendColor: layer.legendColor,
      group: layer.group,
      order: layer.order,
      unit: layer.unit,
      show:
        show == null || layer.name !== interactedLayer.name ? layer.show : show,
    });
  };

  public updateLayers(
    name: IbfLayerName,
    active: boolean,
    show: boolean,
  ): void {
    const interactedLayerIndex = this.getLayerIndexById(name);
    const interactedLayer = this.layers[interactedLayerIndex];
    if (interactedLayerIndex >= 0) {
      this.layers.forEach((layer: IbfLayer): void => {
        let layerObservable: Observable<GeoJSON.FeatureCollection> = EMPTY;
        const layerDataCacheKey = `${this.country.countryCodeISO3}_${this.timelineService.activeLeadTime}_${this.adminLevelService.adminLevel}_${layer.name}_${this.mockScenario}`;
        const layerActive = this.isLayerActive(active, layer, interactedLayer);
        if (this.layerDataCache[layerDataCacheKey]) {
          layerObservable = this.layerDataCache[layerDataCacheKey];
        } else if (layerActive) {
          layerObservable = this.getLayerData(layer, layerDataCacheKey);
        }
        layerObservable.subscribe(
          this.updateLayer(layerActive, show, layer, interactedLayer),
        );
      });
    } else {
      throw Error(`Layer '${name}' does not exist`);
    }
  }

  public getLayerData(
    layer: IbfLayer,
    layerDataCacheKey: string,
  ): Observable<GeoJSON.FeatureCollection> {
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
    } else if (layer.name === IbfLayerName.glofasStations) {
      layerData = this.apiService
        .getStations(
          this.country.countryCodeISO3,
          this.timelineService.activeLeadTime,
        )
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.adminRegions) {
      layerData = this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.timelineService.activeLeadTime,
          this.adminLevelService.adminLevel,
        )
        .pipe(shareReplay(1));
    } else {
      // In case layer is aggregate layer
      layerData = this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.timelineService.activeLeadTime,
          this.adminLevelService.adminLevel,
        )
        .pipe(shareReplay(1));
    }
    this.layerDataCache[layerDataCacheKey] = layerData;
    return layerData;
  }

  getAdminRegionFillColor = (
    colorPropertyValue,
    colorThreshold,
    placeCode: string,
  ): string => {
    let adminRegionFillColor = this.state.defaultColor;
    switch (true) {
      case colorPropertyValue <= colorThreshold[breakKey.break1]:
        adminRegionFillColor = this.state.colorGradient[0];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break2]:
        adminRegionFillColor = this.state.colorGradient[1];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break3]:
        adminRegionFillColor = this.state.colorGradient[2];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break4]:
        adminRegionFillColor = this.state.colorGradient[3];
        break;
      case colorPropertyValue > colorThreshold[breakKey.break5]:
        adminRegionFillColor = this.state.colorGradient[4];
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

  getAdminRegionFillOpacity = (layer: IbfLayer, placeCode: string): number => {
    let fillOpacity = this.state.defaultFillOpacity;
    let unselectedFillOpacity = this.unselectedFillOpacity;
    const hoverFillOpacity = this.hoverFillOpacity;

    if (layer.name === IbfLayerName.adminRegions) {
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
    return this.state.defaultWeight;
  };

  getAdminRegionColor = (layer: IbfLayer): string => {
    return layer.name === IbfLayerName.adminRegions
      ? this.state.defaultColor
      : this.state.transparentColor;
  };

  public getColorThreshold = (adminRegions, colorProperty, colorBreaks) => {
    if (colorBreaks) {
      return {
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
          : feature.properties.indicators[colorProperty],
      )
      .filter((v, i, a) => a.indexOf(v) === i);

    const colorThreshold = {
      break1: quantile(colorPropertyValues, 0.2),
      break2: quantile(colorPropertyValues, 0.4),
      break3: quantile(colorPropertyValues, 0.6),
      break4: quantile(colorPropertyValues, 0.8),
    };
    return colorThreshold;
  };

  public setAdminRegionStyle = (layer: IbfLayer) => {
    const colorProperty = layer.colorProperty;
    const colorThreshold = this.getColorThreshold(
      layer.data,
      colorProperty,
      layer.colorBreaks,
    );
    const trigger = this.eventService.state.activeTrigger;

    return (adminRegion) => {
      const fillColor = this.getAdminRegionFillColor(
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : adminRegion.properties.indicators[colorProperty],
        colorThreshold,
        adminRegion.properties.pcode,
      );
      const fillOpacity = this.getAdminRegionFillOpacity(
        layer,
        adminRegion.properties.pcode,
      );
      let weight = this.getAdminRegionWeight(layer);
      let color = this.getAdminRegionColor(layer);
      let dashArray;
      if (adminRegion.properties.pcode.includes('Disputed')) {
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
