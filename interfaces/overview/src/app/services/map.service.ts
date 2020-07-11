import { Injectable } from '@angular/core';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public state = {
    layers: [] as IbfLayer[],
  };

  constructor(private apiService: ApiService) {}

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
    countryCode: string,
    currentPrev: string,
    leadTime: string,
  ) {
    return await this.apiService.getStations(
      countryCode,
      currentPrev,
      leadTime,
    );
  }
}
