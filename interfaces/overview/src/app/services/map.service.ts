import { Injectable } from '@angular/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import { CRS, LatLngBoundsLiteral } from 'leaflet';
import { Observable, Subject } from 'rxjs';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevel } from 'src/app/types/admin-level.enum';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerLabel, IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';
import { IbfLayerWMS } from 'src/app/types/ibf-layer-wms';
import { environment } from 'src/environments/environment';
import { quantile } from 'src/shared/utils';
import { IndicatorEnum } from '../types/indicator-group';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private layerSubject = new Subject<IbfLayer>();
  private layers = [] as IbfLayer[];

  public state = {
    bounds: [
      [-20, -20],
      [20, 20],
    ] as LatLngBoundsLiteral,
    colorGradient: ['#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252'],
    defaultColor: '#969696',
    defaultColorProperty: IndicatorEnum.PopulationExposed,
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
  ) {}

  public async loadStationLayer() {
    this.addLayer({
      name: IbfLayerName.glofasStations,
      label: IbfLayerLabel.glofasStations,
      type: IbfLayerType.point,
      description: 'loadStationLayer',
      active: true,
      data: await this.getStations(),
      viewCenter: false,
    });
  }

  public async loadAdminRegionLayer() {
    this.addLayer({
      name: IbfLayerName.adminRegions,
      label: IbfLayerLabel.adminRegions,
      type: IbfLayerType.shape,
      description: 'loadAdminRegionLayer',
      active: true,
      data: await this.getAdminRegions(),
      viewCenter: true,
      colorProperty: this.state.defaultColorProperty,
    });
  }

  public async updateAdminRegionLayer(
    colorProperty: string,
    leadTime: string = '7-day',
    adminLevel: AdminLevel = AdminLevel.adm2,
  ) {
    this.addLayer({
      name: IbfLayerName.adminRegions,
      label: IbfLayerLabel.adminRegions,
      type: IbfLayerType.shape,
      description: 'updateAdminRegionLayer',
      active: true,
      data: await this.getAdminRegions(),
      viewCenter: true,
      colorProperty: colorProperty,
    });
  }

  private async loadWmsLayer(
    layerName: IbfLayerName,
    layerLabel: IbfLayerLabel,
    active: boolean,
    timestep?: string,
    legendColor?: string,
  ) {
    this.addLayer({
      name: layerName,
      label: layerLabel,
      type: IbfLayerType.wms,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      active: active,
      viewCenter: false,
      data: null,
      legendColor: legendColor,
      wms: {
        url: environment.geoserver_url,
        name: `ibf-system:${layerName}_${timestep ? timestep + '_' : ''}${
          this.countryService.selectedCountry.countryCode
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
      true,
      this.timelineService.state.selectedTimeStepButtonValue,
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
    if (viewCenter && data.features.length) {
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

  private removeLayers() {
    this.layerSubject.next();
  }

  getLayers(): Observable<IbfLayer> {
    return this.layerSubject.asObservable();
  }

  private getLayerIndexById(name: string): number {
    return this.layers.findIndex((layer: IbfLayer) => {
      return layer.name === name;
    });
  }

  public async setLayerState(name: string, state: boolean): Promise<void> {
    const layerIndex = this.getLayerIndexById(name);
    if (layerIndex >= 0) {
      this.addLayer({
        name: this.layers[layerIndex].name,
        label: this.layers[layerIndex].label,
        type: this.layers[layerIndex].type,
        description: this.layers[layerIndex].description,
        active: state,
        viewCenter: false,
        data: this.layers[layerIndex].data,
        wms: this.layers[layerIndex].wms,
        colorProperty: this.layers[layerIndex].colorProperty,
        legendColor: this.layers[layerIndex].legendColor,
      });
    } else {
      throw `Layer '${name}' does not exist`;
    }
  }

  public async getStations(): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getStations(
      this.countryService.selectedCountry.countryCode,
      this.timelineService.state.selectedTimeStepButtonValue,
    );
  }

  public async getAdminRegions(): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getAdminRegions(
      this.countryService.selectedCountry.countryCode,
      this.timelineService.state.selectedTimeStepButtonValue,
      this.adminLevelService.adminLevel,
    );
  }

  getAdminRegionFillColor = (colorPropertyValue, colorThreshold) => {
    let adminRegionFillColor = this.state.defaultColor;
    switch (true) {
      case colorPropertyValue < colorThreshold['0.2']:
        adminRegionFillColor = this.state.colorGradient[0];
        break;
      case colorPropertyValue < colorThreshold['0.4']:
        adminRegionFillColor = this.state.colorGradient[1];
        break;
      case colorPropertyValue < colorThreshold['0.6']:
        adminRegionFillColor = this.state.colorGradient[2];
        break;
      case colorPropertyValue < colorThreshold['0.8']:
        adminRegionFillColor = this.state.colorGradient[3];
        break;
      case colorPropertyValue > colorThreshold['0.8']:
        adminRegionFillColor = this.state.colorGradient[4];
        break;
      default:
        adminRegionFillColor = this.state.defaultColor;
    }
    return adminRegionFillColor;
  };

  getAdminRegionFillOpacity = (adminRegion) => {
    return this.state.defaultFillOpacity;
  };

  getAdminRegionWeight = (adminRegion) => {
    return this.state.defaultWeight;
  };

  getAdminRegionColor = (adminRegion) => {
    return this.state.defaultColor;
  };

  public getColorThreshold = (adminRegions, colorProperty) => {
    const colorPropertyValues = adminRegions.features
      .map((feature) =>
        typeof feature.properties[colorProperty] !== 'undefined'
          ? feature.properties[colorProperty]
          : feature.properties.indicators[colorProperty],
      )
      .filter((v, i, a) => a.indexOf(v) === i);

    const colorThreshold = {
      0.2: quantile(colorPropertyValues, 0.2),
      0.4: quantile(colorPropertyValues, 0.4),
      0.6: quantile(colorPropertyValues, 0.6),
      0.8: quantile(colorPropertyValues, 0.8),
    };
    return colorThreshold;
  };

  public setAdminRegionStyle = (adminRegions, colorProperty) => {
    const colorThreshold = this.getColorThreshold(adminRegions, colorProperty);

    return (adminRegion) => {
      const fillColor = this.getAdminRegionFillColor(
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : adminRegion.properties.indicators[colorProperty],
        colorThreshold,
      );
      const fillOpacity = this.getAdminRegionFillOpacity(adminRegion);
      const weight = this.getAdminRegionWeight(adminRegion);
      const color = this.getAdminRegionColor(adminRegion);
      return {
        fillColor,
        fillOpacity,
        weight,
        color,
      };
    };
  };
}
