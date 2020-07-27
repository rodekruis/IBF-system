import { Injectable } from '@angular/core';
import center from '@turf/center';
import { containsNumber } from '@turf/invariant';
import { LatLngLiteral } from 'leaflet';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';
import { environment } from 'src/environments/environment';
import { quantile } from 'src/shared/utils';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public state = {
    countryCode: '',
    center: {
      lat: 0,
      lng: 0,
    } as LatLngLiteral,
    layers: [] as IbfLayer[],
    defaultColorProperty: 'population_affected',
    colorGradient: ['#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252'],
    defaultColor: '#969696',
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  constructor(private apiService: ApiService) {
    this.state.countryCode = environment.defaultCountryCode;
  }

  public async loadData() {
    this.addLayer({
      name: IbfLayerName.waterStations,
      type: IbfLayerType.point,
      active: true,
      data: await this.getStations(),
    });
    this.addLayer({
      name: IbfLayerName.adminRegions,
      type: IbfLayerType.shape,
      active: true,
      data: await this.getAdminRegions(),
    });
  }

  private addLayer({ name, type, active, data }) {
    const layerCenterCoordinates = center(data).geometry.coordinates;
    this.state.center = containsNumber(layerCenterCoordinates)
      ? ({
          lng: layerCenterCoordinates[0],
          lat: layerCenterCoordinates[1],
        } as LatLngLiteral)
      : this.state.center;
    this.state.layers.push({ name, type, active, data });
  }

  private getLayerIndexById(name: string): number {
    return this.state.layers.findIndex((layer: IbfLayer) => {
      return layer.name === name;
    });
  }

  public async setLayerState(name: string, state: boolean): Promise<void> {
    const layerIndex = this.getLayerIndexById(name);
    this.state.layers[layerIndex].active = state;
  }

  public async getStations(
    leadTime: string = '7-day',
  ) {
    return await this.apiService.getStations(
      this.state.countryCode,
      leadTime,
    );
  }

  public async getAdminRegions(
    adminLevel: number = 2,
    leadTime: string = '7-day',
  ) {
    return await this.apiService.getAdminRegions(
      // this.state.countryCode,
      'ZMB', // For now statically return ZMB
      adminLevel,
      leadTime,
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

  public setAdminRegionStyle = (adminRegions, colorProperty) => {
    const colorPropertyValues = adminRegions.features
      .map((feature) => feature.properties[colorProperty])
      .filter((v, i, a) => a.indexOf(v) === i);

    const colorThreshold = {
      0.2: quantile(colorPropertyValues, 0.2),
      0.4: quantile(colorPropertyValues, 0.4),
      0.6: quantile(colorPropertyValues, 0.6),
      0.8: quantile(colorPropertyValues, 0.8),
    };

    return (adminRegion) => {
      const fillColor = this.getAdminRegionFillColor(
        adminRegion.properties[colorProperty],
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
