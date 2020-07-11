import { Injectable } from '@angular/core';
import { LatLngLiteral } from 'leaflet';
import { IbfLayer } from 'src/app/types/ibf-layer';
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

  private getLayerIndexById(id: string): number {
    return this.state.layers.findIndex((layer: Layer) => {
      return layer.id === id;
    });
  }

  public async setLayerState(id: string, state: boolean): Promise<void> {
    const layerIndex = this.getLayerIndexById(id);
    this.state.layers[layerIndex].active = state;
  }

  public async getStations(
    currentPrev: string = 'Current',
    leadTime: string = '3-day',
  ) {
    return await this.apiService.getStations(
      this.state.countryCode,
      currentPrev,
      leadTime,
    );
  }
}
