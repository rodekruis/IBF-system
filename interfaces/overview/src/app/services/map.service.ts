import { Injectable } from '@angular/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import { LatLngBoundsLiteral } from 'leaflet';
import { Observable, Subject } from 'rxjs';
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
  private layerSubject = new Subject<IbfLayer>();
  private layers = [] as IbfLayer[];

  public state = {
    countryCode: '',
    bounds: [
      [-20, -20],
      [20, 20],
    ] as LatLngBoundsLiteral,
    defaultColorProperty: 'population',
    colorGradient: ['#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252'],
    defaultColor: '#969696',
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  constructor(private apiService: ApiService) {
    this.state.countryCode = environment.defaultCountryCode;
  }

  public async loadData(leadTime: string = '7-day', adminLevel: number = 2) {
    this.removeLayers();
    this.addLayer({
      name: IbfLayerName.glofasStations,
      type: IbfLayerType.point,
      active: true,
      data: await this.getStations(leadTime),
      viewCenter: true,
    });
    this.addLayer({
      name: IbfLayerName.adminRegions,
      type: IbfLayerType.shape,
      data: await this.getAdminRegionsStatic(adminLevel),
    });
  }

  private addLayer({ name, type, active, data, viewCenter }) {
    if (viewCenter) {
      const layerBounds = bbox(data);
      this.state.bounds = containsNumber(layerBounds)
        ? ([
            [layerBounds[1], layerBounds[0]],
            [layerBounds[3], layerBounds[2]],
          ] as LatLngBoundsLiteral)
        : this.state.bounds;
    }
    const newLayer = { name, type, active, data };
    this.layerSubject.next(newLayer);
    const layerIndex = this.getLayerIndexById(name);
    if (layerIndex >= 0) {
      this.layers.splice(layerIndex, 1, newLayer);
    } else {
      this.layers.push(newLayer);
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
        type: this.layers[layerIndex].type,
        active: state,
        data: this.layers[layerIndex].data,
        viewCenter: true,
      });
    } else {
      throw `Layer '${name}' does not exist`;
    }
  }

  public async getStations(leadTime: string = '7-day') {
    return await this.apiService.getStations(this.state.countryCode, leadTime);
  }

  public async getAdminRegionsStatic(adminLevel: number = 2) {
    return await this.apiService.getAdminRegionsStatic(
      this.state.countryCode,
      adminLevel,
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
      .map((feature) => feature.properties.indicators[colorProperty])
      .filter((v, i, a) => a.indexOf(v) === i);

    const colorThreshold = {
      0.2: quantile(colorPropertyValues, 0.2),
      0.4: quantile(colorPropertyValues, 0.4),
      0.6: quantile(colorPropertyValues, 0.6),
      0.8: quantile(colorPropertyValues, 0.8),
    };

    return (adminRegion) => {
      const fillColor = this.getAdminRegionFillColor(
        adminRegion.properties.indicators[colorProperty],
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
