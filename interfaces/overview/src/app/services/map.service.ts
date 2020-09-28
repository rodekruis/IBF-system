import { Injectable, OnDestroy } from '@angular/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import { CRS, LatLngBoundsLiteral } from 'leaflet';
import { Observable, Subject, Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';
import { IbfLayerWMS } from 'src/app/types/ibf-layer-wms';
import { environment } from 'src/environments/environment';
import { quantile } from 'src/shared/utils';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnDestroy {
  private layerSubject = new Subject<IbfLayer>();
  private layers = [] as IbfLayer[];
  private countrySubscription: Subscription;
  private timelineSubscription: Subscription;

  public state = {
    bounds: [
      [-20, -20],
      [20, 20],
    ] as LatLngBoundsLiteral,
    colorGradient: ['#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252'],
    defaultColor: '#969696',
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    private apiService: ApiService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.loadAdminRegionLayer(country.countryCode);
        this.loadFloodExtentLayer(country.countryCode);
        this.loadPopulationGridLayer(country.countryCode);
      });
    this.timelineSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe((timeline: string) => {
        this.loadStationLayer(
          this.countryService.selectedCountry.countryCode,
          timeline,
        );
        this.loadAdminRegionLayer(
          this.countryService.selectedCountry.countryCode,
          timeline,
        );
        this.loadFloodExtentLayer(
          this.countryService.selectedCountry.countryCode,
          timeline,
        );
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
    this.timelineSubscription.unsubscribe();
  }

  public async loadStationLayer(
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
  ) {
    this.addLayer({
      name: IbfLayerName.glofasStations,
      type: IbfLayerType.point,
      active: true,
      data: await this.getStations(countryCode, leadTime),
      viewCenter: false,
    });
  }

  public async loadAdminRegionLayer(
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
    adminLevel: number = 2,
  ) {
    this.addLayer({
      name: IbfLayerName.adminRegions,
      type: IbfLayerType.shape,
      active: true,
      data: await this.getAdminRegions(countryCode, leadTime, adminLevel),
      viewCenter: true,
      defaultColorProperty: 'population_affected', // 'population_affected' / 'population'
    });
  }

  public async updateAdminRegionLayer(
    colorProperty: string,
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
    adminLevel: number = 2,
  ) {
    this.addLayer({
      name: IbfLayerName.adminRegions,
      type: IbfLayerType.shape,
      active: true,
      data: await this.getAdminRegions(countryCode, leadTime, adminLevel),
      viewCenter: true,
      defaultColorProperty: colorProperty,
    });
  }

  public async loadFloodExtentLayer(
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
  ) {
    this.addLayer({
      name: IbfLayerName.floodExtent,
      type: IbfLayerType.wms,
      active: true,
      viewCenter: false,
      data: null,
      wms: {
        url: environment.geoserver_url,
        name: `ibf-system:flood_extent_${leadTime}_${countryCode}`,
        format: 'image/png',
        version: '1.1.0',
        attribution: '510 Global',
        crs: CRS.EPSG4326,
        transparent: true,
      } as IbfLayerWMS,
    });
  }

  public async loadPopulationGridLayer(
    countryCode: string = environment.defaultCountryCode,
  ) {
    this.addLayer({
      name: IbfLayerName.populationGrid,
      type: IbfLayerType.wms,
      active: false,
      viewCenter: false,
      data: null,
      wms: {
        url: environment.geoserver_url,
        name: `ibf-system:population_${countryCode}`,
        format: 'image/png',
        version: '1.1.0',
        attribution: '510 Global',
        crs: CRS.EPSG4326,
        transparent: true,
      } as IbfLayerWMS,
    });
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
        type: this.layers[layerIndex].type,
        active: state,
        viewCenter: false,
        data: this.layers[layerIndex].data,
        wms: this.layers[layerIndex].wms,
        defaultColorProperty: this.layers[layerIndex].defaultColorProperty,
      });
    } else {
      throw `Layer '${name}' does not exist`;
    }
  }

  public async getStations(
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
  ): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getStations(countryCode, leadTime);
  }

  public async getAdminRegions(
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
    adminLevel: number = 2,
  ): Promise<GeoJSON.FeatureCollection> {
    return await this.apiService.getAdminRegions(
      countryCode,
      leadTime,
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
