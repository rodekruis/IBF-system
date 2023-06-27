import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country, DisasterType } from '../models/country.model';
import {
  IbfLayer,
  IbfLayerLabel,
  IbfLayerMetadata,
  IbfLayerName,
  IbfLayerType,
} from '../types/ibf-layer';
import { Indicator } from '../types/indicator-group';
import { AdminLevelService } from './admin-level.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PreloadedLayersService {
  private preloadedLayers: IbfLayer[] = [];
  private preloadedLayersSubject = new BehaviorSubject<IbfLayer[]>([]);

  constructor(
    private apiService: ApiService,
    private adminLevelService: AdminLevelService,
  ) {}

  private async getLayerData(
    layerName,
    countryCodeISO3,
  ): Promise<{
    label: IbfLayerLabel;
    type: IbfLayerType;
    show: boolean;
    viewCenter: boolean;
    order: number;
    data: GeoJSON.FeatureCollection;
  }> {
    const layersData = {
      [IbfLayerName.waterpoints]: {
        label: IbfLayerLabel.waterpoints,
        type: IbfLayerType.point,
        show: false,
        viewCenter: false,
        order: 2,
      },
    };

    let data;
    switch (layerName) {
      case IbfLayerName.waterpoints:
        data = await this.apiService
          .getWaterPoints(countryCodeISO3)
          .toPromise();
        break;
      default:
        data = [];
        break;
    }

    return { ...layersData[layerName], data };
  }

  public async preloadLayer(
    layer: IbfLayerMetadata,
    country: Country,
    disasterType: DisasterType,
  ) {
    if (!layer) {
      return;
    }

    if (this.preloadedLayers.some((l) => l.name === layer.name)) {
      return;
    }

    const layerData = await this.getLayerData(
      layer.name,
      country.countryCodeISO3,
    );

    const createdLayer: IbfLayer = {
      name: layer.name,
      label: layerData.label,
      type: layerData.type,
      description: this.getPopoverText(layer, country, disasterType),
      active: this.adminLevelService.activeLayerNames.includes(layer.name),
      show: layerData.show,
      data: layerData.data,
      viewCenter: layerData.viewCenter,
      order: layerData.order,
    };

    this.preloadedLayers.push(createdLayer);
    this.preloadedLayersSubject.next(this.preloadedLayers);
  }

  private getPopoverText(
    indicator: IbfLayerMetadata | Indicator,
    country: Country,
    disasterType: DisasterType,
  ): string {
    if (
      indicator.description &&
      indicator.description[country.countryCodeISO3] &&
      indicator.description[country.countryCodeISO3][disasterType.disasterType]
    ) {
      return indicator.description[country.countryCodeISO3][
        disasterType.disasterType
      ];
    }
    return '';
  }

  public getPreloadedLayers(): Observable<IbfLayer[]> {
    return this.preloadedLayersSubject.asObservable();
  }
}
