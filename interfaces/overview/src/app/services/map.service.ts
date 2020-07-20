import { Injectable } from '@angular/core';
import center from '@turf/center';
import { containsNumber } from '@turf/invariant';
import { LatLngLiteral } from 'leaflet';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';
import { environment } from 'src/environments/environment';
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
    currentPrev: string = 'Current',
    leadTime: string = '7-day',
  ) {
    return await this.apiService.getStations(
      this.state.countryCode,
      currentPrev,
      leadTime,
    );
  }

  public async getAdminRegions(
    adminLevel: number = 2,
    currentPrev: string = 'Current',
    leadTime: string = '7-day',
  ) {
    return await this.apiService.getAdminRegions(
      this.state.countryCode,
      adminLevel,
      currentPrev,
      leadTime,
    );
  }

  getAdminRegionFillColor = (adminRegion, colorProperty) => {
    return adminRegion.properties[colorProperty] > 10000 ? 'red' : 'green';
  };

  getAdminRegionFillOpacity = (adminRegion) => {
    return 0.2;
  };

  getAdminRegionWeight = (adminRegion) => {
    return 1;
  };

  public setAdminRegionStyle = (adminRegions, colorProperty) => {
    return (adminRegion) => {
      const fillColor = this.getAdminRegionFillColor(
        adminRegion,
        colorProperty,
      );
      const fillOpacity = this.getAdminRegionFillOpacity(adminRegion);
      const weight = this.getAdminRegionWeight(adminRegion);
      return { color: fillColor, fillOpacity: fillOpacity, weight: weight };
    };
  };
}
