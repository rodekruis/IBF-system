import { Injectable } from '@angular/core';
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
  IbfLayerName,
  IbfLayerType,
  IbfLayerWMS,
} from 'src/app/types/ibf-layer';
import { LeadTime } from 'src/app/types/lead-time';
import { Indicator, IndicatorName, NumberFormat } from 'src/app/types/indicator-group';
import { environment } from 'src/environments/environment';
import { quantile } from 'src/shared/utils';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private layerSubject = new BehaviorSubject<IbfLayer>(null);
  public layers = [] as IbfLayer[];
  public activeLayerName: IbfLayerName;
  public alertColor: string = '#de9584';
  public safeColor: string = '#2c45fd';
  public hoverFillOpacity: number = 0.6;
  public unselectedFillOpacity: number = 0.4;

  public state = {
    bounds: [
      [-20, -20],
      [20, 20],
    ] as LatLngBoundsLiteral,
    colorGradient: ['#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252'],
    defaultColor: '#969696',
    transparentColor: 'transparent',
    defaultColorProperty: IndicatorName.PopulationAffected,
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
  ) {}

  public async loadStationLayer() {
    this.addLayer({
      name: IbfLayerName.glofasStations,
      label: IbfLayerLabel.glofasStations,
      type: IbfLayerType.point,
      description: 'loadStationLayer',
      active: true,
      show: true,
      data: await this.getStations(),
      viewCenter: false,
      order: 0,
    });
  }

  public async loadRedCrossBranchesLayer() {
    this.addLayer({
      name: IbfLayerName.redCrossBranches,
      label: IbfLayerLabel.redCrossBranches,
      type: IbfLayerType.point,
      description: 'loadRedCrossBranchesLayer',
      active: false,
      show: true,
      data: await this.getRedCrossBranches(),
      viewCenter: false,
      order: 1,
    });
  }

  public async loadWaterpointsLayer() {
    this.addLayer({
      name: IbfLayerName.waterpoints,
      label: IbfLayerLabel.waterpoints,
      type: IbfLayerType.point,
      description: 'loadWaterpointsLayer',
      active: false,
      show: true,
      data: await this.getWaterpoints(),
      viewCenter: false,
      order: 2,
    });
  }

  public async loadAdminRegionLayer() {
    this.addLayer({
      name: IbfLayerName.adminRegions,
      label: IbfLayerLabel.adminRegions,
      type: IbfLayerType.shape,
      description: '',
      active: true,
      show: true,
      data: await this.getAdminRegions(),
      viewCenter: true,
      colorProperty: this.state.defaultColorProperty,
      order: 0,
    });
  }

  public async loadAggregateLayer(indicator: Indicator) {

    // This solution is not pretty. To load a layer in the legend without
    // loading the data an empty geosjon is needed.
    let data = null;
    if (!indicator.lazyLoad) {
      data = await this.getAdminRegions()
    } else {
      data = { features : [] }
    }
    this.addLayer({
      name: indicator.name,
      label: indicator.label,
      type: IbfLayerType.shape,
      description: 'loadAggregateLayer',
      active: indicator.active,
      show: true,
      data: data,
      viewCenter: true,
      colorProperty: indicator.name,
      colorBreaks: indicator.colorBreaks,
      numberFormatMap: indicator.numberFormatMap,
      legendColor: '#969696',
      group: IbfLayerGroup.aggregates,
      order: 20 + indicator.order,
    });
  }

  public async loadAdmin2Data() {
    this.addLayer({
      name: IbfLayerName.covidRisk,
      label: IbfLayerLabel.covidRisk,
      type: IbfLayerType.shape,
      description: 'loadCovidLayer',
      active: true,
      show: true,
      data: await this.getAdmin2Data(),
      viewCenter: true,
      colorProperty: IbfLayerName.covidRisk,
      colorBreaks: null,
      numberFormatMap: NumberFormat.perc,
      legendColor: '#969696',
      group: IbfLayerGroup.aggregates,
      order: 1,
    });
  }

  public async hideAggregateLayers() {
    this.layers.forEach(async (layer: IbfLayer) => {
      if (layer.group === IbfLayerGroup.aggregates) {
        await this.updateLayer(layer.name, layer.active, false);
      }
    });
  }

  private async loadWmsLayer(
    layerName: IbfLayerName,
    layerLabel: IbfLayerLabel,
    active: boolean,
    leadTime?: LeadTime,
    legendColor?: string,
  ) {
    this.addLayer({
      name: layerName,
      label: layerLabel,
      type: IbfLayerType.wms,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      active: active,
      show: true,
      viewCenter: false,
      data: null,
      legendColor: legendColor,
      order: 10,
      wms: {
        url: environment.geoserver_url,
        name: `ibf-system:${layerName}_${leadTime ? leadTime + '_' : ''}${
          this.countryService.activeCountry.countryCodeISO3
        }`,
        format: 'image/png',
        version: '1.1.0',
        attribution: '510 Global',
        crs: CRS.EPSG4326,
        transparent: true,
      } as IbfLayerWMS,
    });
  }

  public async loadFloodExtentLayer() {
    this.loadWmsLayer(
      IbfLayerName.floodExtent,
      IbfLayerLabel.floodExtent,
      this.eventService.state.activeTrigger,
      this.timelineService.activeLeadTime,
      '#d7301f',
    );
  }

  public async loadPopulationGridLayer() {
    this.loadWmsLayer(
      IbfLayerName.population,
      IbfLayerLabel.population,
      false,
      null,
      '#737373',
    );
  }

  public async loadCroplandLayer() {
    this.loadWmsLayer(
      IbfLayerName.cropland,
      IbfLayerLabel.cropland,
      false,
      null,
      '#DCF064',
    );
  }

  public async loadGrasslandLayer() {
    this.loadWmsLayer(
      IbfLayerName.grassland,
      IbfLayerLabel.grassland,
      false,
      null,
      '#be9600',
    );
  }

  private addLayer(layer: IbfLayer) {
    const { name, viewCenter, data } = layer;
    if (viewCenter && data.features && data.features.length) {
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

  getLayers(): Observable<IbfLayer> {
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

  public async updateLayer(
    name: IbfLayerName,
    active: boolean,
    show: boolean,
  ): Promise<void> {
    const triggerLayerIndex = this.getLayerIndexById(name);
    const triggerLayer = this.layers[triggerLayerIndex];
    if (triggerLayerIndex >= 0) {
      this.layers.forEach((layer: IbfLayer): void => {
        this.addLayer({
          name: layer.name,
          label: layer.label,
          type: layer.type,
          description: layer.description,
          active: this.isLayerActive(active, layer, triggerLayer),
          viewCenter: false,
          data: layer.data,
          wms: layer.wms,
          colorProperty: layer.colorProperty,
          colorBreaks: layer.colorBreaks,
          numberFormatMap: layer.numberFormatMap,
          legendColor: layer.legendColor,
          group: layer.group,
          order: layer.order,
          show:
            show == null || layer.name != triggerLayer.name ? layer.show : show,
        });
      });
    } else {
      throw `Layer '${name}' does not exist`;
    }
  }

  public async getStations(): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getStations(
      this.countryService.activeCountry.countryCodeISO3,
      this.timelineService.activeLeadTime,
    );
  }

  public async getRedCrossBranches(): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getRedCrossBranches(
      this.countryService.activeCountry.countryCodeISO3,
    );
  }

  public async getWaterpoints(): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getWaterpoints(
      this.countryService.activeCountry.countryCodeISO3,
    );
  }

  public async getAdminRegions(): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getAdminRegions(
      this.countryService.activeCountry.countryCodeISO3,
      this.timelineService.activeLeadTime,
      this.adminLevelService.adminLevel,
    );
  }

  public async getAdmin2Data(): Promise<GeoJSON.FeatureCollection> {
    const data = await this.apiService.getAdmin2Data();
    return data
  }

  getAdminRegionFillColor = (
    colorPropertyValue,
    colorThreshold,
    placeCode: string,
  ): string => {
    let adminRegionFillColor = this.state.defaultColor;
    switch (true) {
      case colorPropertyValue <= colorThreshold['break1']:
        adminRegionFillColor = this.state.colorGradient[0];
        break;
      case colorPropertyValue <= colorThreshold['break2']:
        adminRegionFillColor = this.state.colorGradient[1];
        break;
      case colorPropertyValue <= colorThreshold['break3']:
        adminRegionFillColor = this.state.colorGradient[2];
        break;
      case colorPropertyValue <= colorThreshold['break4']:
        adminRegionFillColor = this.state.colorGradient[3];
        break;
      case colorPropertyValue > colorThreshold['break4']:
        adminRegionFillColor = this.state.colorGradient[4];
        break;
      default:
        adminRegionFillColor = this.state.defaultColor;
    }

    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe((activePlaceCode: PlaceCode): void => {
        if (activePlaceCode && activePlaceCode.placeCode === placeCode) {
          adminRegionFillColor = this.eventService.state.activeTrigger
            ? this.alertColor
            : this.safeColor;
        }
      });

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

    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe((activePlaceCode: PlaceCode): void => {
        if (activePlaceCode) {
          if (activePlaceCode.placeCode === placeCode) {
            fillOpacity = this.hoverFillOpacity;
          } else {
            fillOpacity = this.unselectedFillOpacity;
          }
        }
      });

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
        adminRegion.properties[IndicatorName.PopulationAffected] > 0,
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
