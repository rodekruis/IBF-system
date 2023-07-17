import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country, DisasterType } from '../models/country.model';
import { breakKey } from '../models/map.model';
import { DisasterTypeKey } from '../types/disaster-type-key';
import { EventState } from '../types/event-state';
import { IbfLayer, IbfLayerName, wmsLegendType } from '../types/ibf-layer';
import { NumberFormat } from '../types/indicator-group';
import { CountryService } from './country.service';
import { DisasterTypeService } from './disaster-type.service';
import { EventService } from './event.service';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root',
})
export class MapLegendService implements OnDestroy {
  private legendDivTitle = `<div style='margin-bottom: 8px'><strong>Map Legend</strong></div>`;

  public eventState: EventState;
  private country: Country;
  private disasterType: DisasterType;

  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;

  layerIconURLPrefix = 'assets/markers/';
  private layerIcon = {
    [IbfLayerName.glofasStations]: 'glofas-station-no-trigger',
    [IbfLayerName.typhoonTrack]: 'typhoon-track.png',
    [IbfLayerName.redCrossBranches]: 'red-cross-marker.svg',
    [IbfLayerName.damSites]: 'dam-marker.svg',
    [IbfLayerName.waterpoints]: 'water-point-marker.svg',
    [IbfLayerName.waterpointsInternal]: 'water-point-marker.svg',
    [IbfLayerName.healthSites]: 'health-center-marker.svg',
    [IbfLayerName.evacuationCenters]: 'evacuation-center-marker.svg',
    [IbfLayerName.schools]: 'school-marker.svg',
    [IbfLayerName.communityNotifications]: 'community-notification-marker.svg',
  };

  constructor(
    private mapService: MapService,
    private eventService: EventService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.initialEventStateSubscription = this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.manualEventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  ngOnDestroy() {
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
  }

  public getLegendTitle(): string {
    return this.legendDivTitle;
  }

  public getPointLegendString(layer: IbfLayer): string {
    return `<ion-row style='padding: 4px'><div style='height: 24px; width: 16px; margin-right: 4px'><img src='${
      this.layerIconURLPrefix
    }${
      this.layerIcon[layer.name]
    }' /></div><ion-label style='padding-top: 2px'>${
      layer.label
    }</ion-label> </ion-row>`;
  }

  public getShapeLegendString(layer: IbfLayer): string {
    if (layer.name === IbfLayerName.alertThreshold) {
      return `<ion-row style='padding: 4px'><div style="width: 16px; height: 16px; border:2px solid red; margin-right: 4px"></div><ion-label>${layer.label}</ion-label></ion-row>`;
    }

    if (!layer.data) {
      return '';
    }

    const colorThreshold = this.mapService.getColorThreshold(
      layer.data,
      layer.colorProperty,
      layer.colorBreaks,
    );

    const grades = Object.values(colorThreshold);
    let labels;
    if (layer.colorBreaks) {
      labels = Object.values(layer.colorBreaks).map(
        (colorBreak) => colorBreak.label,
      );
    }

    const colors =
      this.eventState?.activeTrigger && this.eventState?.thresholdReached
        ? this.mapService.state.colorGradientTriggered
        : this.mapService.state.colorGradient;

    const getColor = this.getFeatureColorByColorsAndColorThresholds(
      colors,
      colorThreshold,
    );

    const getLabel = this.getLabel(grades, layer, labels);

    let element = '<div style="padding: 4px">';
    element +=
      `<strong>${layer.label}` +
      (layer.unit ? ' (' + layer.unit + ')' : '') +
      '</strong>';

    const noDataEntryFound = layer.data?.features.find(
      (f) => f.properties?.indicators[layer.name] === null,
    );
    element += `<div style='margin-top: 8px'>`;
    if (noDataEntryFound) {
      element += `<i style="background:${this.mapService.state.noDataColor}"></i> No data<br>`;
    }

    for (let i = 0; i < grades.length; i++) {
      if (grades[i] !== null && (i === 0 || grades[i] > grades[i - 1])) {
        element += `<i style="background:${getColor(
          grades[i + 1],
        )}"></i> ${getLabel(i)}`;
      }
    }
    element += `</div>`;

    element += '</div>';

    return element;
  }

  public getWmsLegendString(layer: IbfLayer): string {
    let element = '<div style="padding: 4px">';
    const typeKey = 'type';
    let legendType = layer.legendColor[this.country.countryCodeISO3][typeKey];
    const valueKey = 'value';
    let value = layer.legendColor[this.country.countryCodeISO3][valueKey];

    // hardcoded exception for MWI floods flood_extent
    if (
      this.country.countryCodeISO3 === 'MWI' &&
      this.disasterType.disasterType === DisasterTypeKey.floods
    ) {
      legendType = wmsLegendType.square;
      value = [value[2]];
    }

    const lineBorderStyle =
      'border-color: #fff; border-style: solid; border-width: 7px 0;';

    switch (legendType) {
      case wmsLegendType.exposureLine:
        element += `<ion-row><div style="width: 16px; height: 16px; background:${value[0]}; ${lineBorderStyle} margin-right: 4px"></div><ion-label>Exposed ${layer.label}</ion-label></ion-row>`;
        element += `<ion-row style="margin-top: 4px"><div style="width: 16px; height: 16px; background:${value[1]}; ${lineBorderStyle} margin-right: 4px"></div><ion-label>Non Exposed ${layer.label}</ion-label></ion-row>`;
        break;
      case wmsLegendType.exposureSquare:
        element += `<ion-row><div style="width: 16px; height: 16px; background:${value[0]}; border: 7px 0 solid #fff; margin-right: 4px"></div><ion-label>Exposed ${layer.label}</ion-label></ion-row>`;
        element += `<ion-row style="margin-top: 4px"><div style="width: 16px; height: 16px; background:${value[1]}; margin-right: 4px"></div><ion-label>Non Exposed ${layer.label}</ion-label></ion-row>`;
        break;
      case wmsLegendType.gradient:
        element +=
          `<strong>${layer.label}` +
          (layer.unit ? ' (' + layer.unit + ')' : '') +
          '</strong>' +
          '<ion-row style="margin-top: 2px">';

        for (const color of value) {
          element += `<div style="width: 16px; height: 16px; background:${color}"></div>`;
        }
        element += '</ion-row>';
        break;
      case wmsLegendType.square:
        element += `<ion-row><div style="width: 16px; height: 16px; background:${value[0]}; margin-right: 4px"></div><ion-label>${layer.label}</ion-label></ion-row>`;
        break;
      default:
        break;
    }
    element += '</div>';
    return element;
  }

  private getFeatureColorByColorsAndColorThresholds = (
    colors,
    colorThreshold,
  ) => (feature) => {
    return feature <= colorThreshold[breakKey.break1] ||
      !colorThreshold[breakKey.break1]
      ? colors[0]
      : feature <= colorThreshold[breakKey.break2] ||
        !colorThreshold[breakKey.break2]
      ? colors[1]
      : feature <= colorThreshold[breakKey.break3] ||
        !colorThreshold[breakKey.break3]
      ? colors[2]
      : feature <= colorThreshold[breakKey.break4] ||
        !colorThreshold[breakKey.break4]
      ? colors[3]
      : colors[4];
  };

  private getLabel = (grades, layer, labels) => (i) => {
    const label = labels ? '  -  ' + labels[i] : '';
    if (layer.colorBreaks) {
      const valueLow = layer.colorBreaks && layer.colorBreaks[i + 1]?.valueLow;
      const valueHigh =
        layer.colorBreaks && layer.colorBreaks[i + 1]?.valueHigh;
      if (valueLow === valueHigh) {
        return this.numberFormat(valueHigh, layer) + label + '<br/>';
      } else {
        return (
          this.numberFormat(valueLow, layer) +
          '&ndash;' +
          this.numberFormat(valueHigh, layer) +
          label +
          '<br/>'
        );
      }
    } else {
      const number1 = this.numberFormat(grades[i], layer);
      const number2 = this.numberFormat(grades[i + 1], layer);
      return (
        number1 +
        (typeof grades[i + 1] !== 'undefined' ? '&ndash;' + number2 : '+') +
        label +
        '<br/>'
      );
    }
  };

  private numberFormat(d, layer) {
    if (d === null) {
      return null;
    } else if (layer.numberFormatMap === NumberFormat.perc) {
      return Math.round(d * 100).toLocaleString() + '%';
    } else if (layer.numberFormatMap === NumberFormat.decimal2) {
      return (Math.round(d * 100) / 100).toLocaleString();
    } else if (layer.numberFormatMap === NumberFormat.decimal0) {
      if (d > 10000000) {
        return Math.round(d / 1000000).toLocaleString() + 'M';
      } else if (d > 1000000) {
        return (Math.round(d / 100000) / 10).toLocaleString() + 'M';
      } else if (d > 10000) {
        return Math.round(d / 1000).toLocaleString() + 'k';
      } else if (d > 1000) {
        return (Math.round(d / 100) / 10).toLocaleString() + 'k';
      } else {
        return Math.round(d).toLocaleString();
      }
    } else {
      return Math.round(d).toLocaleString();
    }
  }

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
  };
}
