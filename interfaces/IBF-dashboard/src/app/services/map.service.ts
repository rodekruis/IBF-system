import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import { CRS, LatLngBoundsLiteral } from 'leaflet';
import { BehaviorSubject, Observable } from 'rxjs';
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
  public adminRegionsObject: object = {};
  public alertColor = '#de9584';
  public safeColor = '#2c45fd';
  public hoverFillOpacity = 0.6;
  public unselectedFillOpacity = 0.4;

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
      .subscribe((country: Country): void => {
        this.country = country;
        this.loadCountryLayers();
      });

    this.adminLevelService.getAdminLevelSubscription().subscribe(() => {
      this.loadAdminRegionLayer(true);
    });

    this.timelineService.getTimelineSubscription().subscribe(() => {
      this.loadCountryLayers();
    });

    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe((placeCode: PlaceCode): void => {
        this.placeCode = placeCode;
      });

    this.mockScenarioService.getMockScenarioSubscription().subscribe(() => {
      this.loadCountryLayers();
    });

    this.translateService
      .get('map-service.popover')
      .subscribe((translatedStrings: { [key: string]: string }) => {
        this.popoverTexts = translatedStrings;
      });
  }

  private getPopoverText(indicatorName: IbfLayerName): string {
    let popoverText = '';
    if (this.popoverTexts[indicatorName]) {
      const triggerState: string = this.eventService.state.activeTrigger
        ? `active-trigger-${this.eventService.disasterType}`
        : 'no-trigger';
      popoverText = this.popoverTexts[indicatorName][triggerState];
    }
    return popoverText;
  }

  public async loadCountryLayers() {
    if (this.country) {
      this.apiService
        .getLayers(this.country.countryCodeISO3)
        .subscribe((layers) => {
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
                layer.leadTimeDependent
                  ? this.timelineService.activeLeadTime
                  : null,
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
            }
          });
        });
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
          .subscribe((stations) => {
            this.addStationLayer(stations);
          });
      } else {
        this.addStationLayer(null);
      }
    }
  }

  private addStationLayer(stations: any) {
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
  }

  private loadRedCrossBranchesLayer(
    label: IbfLayerLabel,
    layerActive: boolean,
  ) {
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
  }

  private addRedCrossBranchesLayer(
    label: IbfLayerLabel,
    redCrossBranches: any,
  ) {
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
  }

  private loadWaterPointsLayer(layerActive: boolean) {
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
  }

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
      if (layerActive)
        this.apiService
          .getAdminRegions(
            this.country.countryCodeISO3,
            this.timelineService.activeLeadTime,
            this.adminLevelService.adminLevel,
          )
          .subscribe((adminRegions) => {
            this.addAdminRegionLayer(adminRegions);
          });
      else this.addAdminRegionLayer(null);
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

  public loadAdmin2Data(indicator: Indicator) {
    this.apiService.getAdmin2Data().subscribe((admin2Data) => {
      this.addLayer({
        name: indicator.name,
        label: indicator.label,
        type: IbfLayerType.shape,
        description: this.getPopoverText(indicator.name),
        active: true,
        show: true,
        data: admin2Data,
        viewCenter: true,
        colorProperty: indicator.name,
        colorBreaks: indicator.colorBreaks,
        numberFormatMap: indicator.numberFormatMap,
        legendColor: '#969696',
        group: IbfLayerGroup.aggregates,
        order: 20 + indicator.order,
      });
    });
  }

  public hideAggregateLayers() {
    this.layers.forEach((layer: IbfLayer) => {
      if (layer.group === IbfLayerGroup.aggregates) {
        this.updateLayer(layer.name, layer.active, false);
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

  private isLayerActive(active, layer, triggerLayer) {
    const isActiveDefined = active != null;
    const isTriggerLayer = layer.name === triggerLayer.name;
    const isTriggerLayerGroup = layer.group === triggerLayer.group;

    let isActive = layer.active;

    if (isActiveDefined && isTriggerLayerGroup) {
      if (isTriggerLayer) {
        isActive = active;
      } else {
        if (layer.group) {
          isActive = false;
        }
      }
    }

    return isActive;
  }

  public updateLayer(name: IbfLayerName, active: boolean, show: boolean): void {
    const triggerLayerIndex = this.getLayerIndexById(name);
    const triggerLayer = this.layers[triggerLayerIndex];
    if (triggerLayerIndex >= 0) {
      this.layers.forEach(
        async (layer: IbfLayer): Promise<void> => {
          this.addLayer({
            name: layer.name,
            label: layer.label,
            type: layer.type,
            description: layer.description,
            active: this.isLayerActive(active, layer, triggerLayer),
            viewCenter: false,
            data: this.layerDataLoadRequired(layer)
              ? await this.getLayerData(layer)
              : layer.data,
            wms: layer.wms,
            colorProperty: layer.colorProperty,
            colorBreaks: layer.colorBreaks,
            numberFormatMap: layer.numberFormatMap,
            legendColor: layer.legendColor,
            group: layer.group,
            order: layer.order,
            unit: layer.unit,
            show:
              show == null || layer.name != triggerLayer.name
                ? layer.show
                : show,
          });
        },
      );
    } else {
      throw Error(`Layer '${name}' does not exist`);
    }
  }

  public layerDataLoadRequired(layer: IbfLayer): boolean {
    if (layer.wms) {
      return false;
    } else if (!layer.data) {
      // layer data has not been loaded yet
      return true;
    } else if (layer.data.features && layer.data.features.length === 0) {
      // layer is aggegrate layer that has not been loaded yet
      return true;
    }
    return false;
  }

  public async getLayerData(
    layer: IbfLayer,
  ): Promise<GeoJSON.FeatureCollection> {
    let data;
    if (layer.name === IbfLayerName.waterpoints) {
      data = await this.getWaterPoints();
    } else if (
      layer.name === IbfLayerName.redCrossBranches ||
      layer.name === IbfLayerName.redCrescentBranches
    ) {
      data = await this.getRedCrossBranches();
    } else if (layer.name === IbfLayerName.glofasStations) {
      data = await this.getStations();
    } else if (layer.name === IbfLayerName.adminRegions) {
      data = await this.getAdminRegions();
    } else if (layer.name === IbfLayerName.covidRisk) {
      data = await this.getAdmin2Data();
    } else {
      // In case layer is aggregate layer
      data = await this.getAdminRegions();
    }
    return data;
  }

  public async getStations(): Promise<GeoJSON.FeatureCollection> {
    return new Promise((resolve): void => {
      this.countryService.getCountrySubscription().subscribe(
        async (country: Country): Promise<void> => {
          let stations = {
            features: [],
          } as GeoJSON.FeatureCollection;

          if (country) {
            stations = await this.apiService
              .getStations(
                country.countryCodeISO3,
                this.timelineService.activeLeadTime,
              )
              .toPromise();
          }

          resolve(stations);
        },
      );
    });
  }

  public async getRedCrossBranches(): Promise<GeoJSON.FeatureCollection> {
    return new Promise((resolve): void => {
      this.countryService.getCountrySubscription().subscribe(
        async (country: Country): Promise<void> => {
          let redCrossBranches = {
            features: [],
          } as GeoJSON.FeatureCollection;

          if (country) {
            redCrossBranches = await this.apiService
              .getRedCrossBranches(country.countryCodeISO3)
              .toPromise();
          }

          resolve(redCrossBranches);
        },
      );
    });
  }

  public async getWaterPoints(): Promise<GeoJSON.FeatureCollection> {
    return new Promise((resolve): void => {
      this.countryService.getCountrySubscription().subscribe(
        async (country: Country): Promise<void> => {
          let waterPoints = {
            features: [],
          } as GeoJSON.FeatureCollection;

          if (country) {
            waterPoints = await this.apiService
              .getWaterPoints(country.countryCodeISO3)
              .toPromise();
          }

          resolve(waterPoints);
        },
      );
    });
  }

  public async getAdminRegions(): Promise<GeoJSON.FeatureCollection> {
    return new Promise((resolve): void => {
      this.countryService.getCountrySubscription().subscribe(
        async (country: Country): Promise<void> => {
          let adminRegions = {
            features: [],
          } as GeoJSON.FeatureCollection;
          if (country) {
            const activeLeadTime = this.timelineService.activeLeadTime
              ? this.timelineService.activeLeadTime
              : LeadTime.day7;
            if (
              this.adminRegionsObject[
                `${country.countryCodeISO3}${activeLeadTime}${this.adminLevelService.adminLevel}`
              ]
            ) {
              // Get admin regions from memory
              adminRegions = this.adminRegionsObject[
                `${country.countryCodeISO3}${activeLeadTime}${this.adminLevelService.adminLevel}`
              ];
            } else {
              // Get admin regions from api
              adminRegions = await this.apiService
                .getAdminRegions(
                  country.countryCodeISO3,
                  this.timelineService.activeLeadTime,
                  this.adminLevelService.adminLevel,
                )
                .toPromise();
              this.adminRegionsObject[
                `${country.countryCodeISO3}${activeLeadTime}${this.adminLevelService.adminLevel}`
              ] = adminRegions;
            }
          }
          resolve(adminRegions);
        },
      );
    });
  }

  public async getAdmin2Data(): Promise<GeoJSON.FeatureCollection> {
    const data = await this.apiService.getAdmin2Data().toPromise();
    return data;
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

  getAdminRegionFillOpacity = (
    layer: IbfLayer,
    trigger: boolean,
    districtTrigger: boolean,
    placeCode: string,
  ): number => {
    let fillOpacity = this.state.defaultFillOpacity;
    if (layer.name === IbfLayerName.adminRegions) {
      fillOpacity = 0.0;
    }
    if (trigger && !districtTrigger) {
      fillOpacity = 0.0;
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
        fillOpacity = this.hoverFillOpacity;
      } else {
        fillOpacity = this.unselectedFillOpacity;
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
        trigger,
        adminRegion.properties[IbfLayerName.population_affected] > 0,
        adminRegion.properties.pcode,
      );
      const weight = this.getAdminRegionWeight(layer);
      const color = this.getAdminRegionColor(layer);
      return {
        fillColor,
        fillOpacity,
        weight,
        color,
      };
    };
  };
}
