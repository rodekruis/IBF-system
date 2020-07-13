import { Injectable } from '@angular/core';
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
  };

  constructor(private apiService: ApiService) {
    this.state.countryCode = environment.defaultCountryCode;
    this.state.center.lat = environment.initialLat;
    this.state.center.lng = environment.initialLng;
  }

  public async loadData() {
    this.addLayer({
      name: IbfLayerName.waterStations,
      type: IbfLayerType.point,
      active: true,
      data: await this.getStations(),
    });
  }

  private addLayer({ name, type, active, data }) {
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
}
