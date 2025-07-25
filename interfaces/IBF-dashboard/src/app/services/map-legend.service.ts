import { Injectable } from '@angular/core';
import { Country, DisasterType } from 'src/app/models/country.model';
import { breakKey } from 'src/app/models/map.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { EventState } from 'src/app/types/event-state';
import {
  IbfLayer,
  IbfLayerLabel,
  IbfLayerName,
  wmsLegendType,
} from 'src/app/types/ibf-layer';
import { NumberFormat } from 'src/app/types/indicator-group';

enum SingleRowLegendType {
  fullSquare = 'full-square',
  fullSquareGradient = 'full-square-gradient',
  line = 'line',
  outlineSquare = 'outline-square',
  pin = 'pin',
}

@Injectable({ providedIn: 'root' })
export class MapLegendService {
  private legendDivTitle = '<div><strong>Map Legend</strong></div>';

  public eventState: EventState;
  private country: Country;
  private disasterType: DisasterType;

  private layerIconURLPrefix = 'assets/markers/';
  private layerIcon = {
    [IbfLayerName.glofasStations]: 'glofas-station.svg',
    [IbfLayerName.typhoonTrack]: 'typhoon-track.png',
    [IbfLayerName.redCrossBranches]: 'red-cross-marker.svg',
    [IbfLayerName.damSites]: 'dam-marker.svg',
    [IbfLayerName.waterpoints]: 'water-point-marker.svg',
    [IbfLayerName.healthSites]: 'health-center-marker.svg',
    [IbfLayerName.evacuationCenters]: 'evacuation-center-marker.svg',
    [IbfLayerName.schools]: 'school-marker.svg',
    [IbfLayerName.communityNotifications]: 'community-notification-marker.svg',
    [IbfLayerName.gauges]: 'river-gauge-marker.svg',
  };

  constructor(
    private mapService: MapService,
    private eventService: EventService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {
    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  public getLegendTitle(): string {
    return this.legendDivTitle;
  }

  public getPointLegendString(layer: IbfLayer, exposed: boolean): string {
    const iconName = String(this.layerIcon[layer.name]);

    if (!iconName) {
      throw new Error(`Icon not found for layer: ${layer.name}`);
    }

    const exposedSuffix = exposed ? '-exposed' : '';
    const iconUrl =
      this.layerIconURLPrefix +
      iconName.slice(0, -4) +
      exposedSuffix +
      iconName.slice(-4);
    const label = exposed ? `Exposed ${layer.label}` : layer.label;

    return this.singleRowLegend(SingleRowLegendType.pin, iconUrl, label);
  }

  public getGlofasPointLegendString(
    layer: IbfLayer,
    glofasState: string,
    label: string,
  ): string {
    const iconName = String(this.layerIcon[layer.name]);

    if (!iconName) {
      throw new Error(`Icon not found for layer: ${layer.name}`);
    }

    const iconUrl =
      this.layerIconURLPrefix +
      iconName.slice(0, -4) +
      glofasState +
      iconName.slice(-4);

    return this.singleRowLegend(
      SingleRowLegendType.pin,
      iconUrl,
      `GloFAS ${label}`,
    );
  }

  public getShapeLegendString(layer: IbfLayer): string {
    if (layer.name === IbfLayerName.trigger) {
      return this.singleRowLegend(
        SingleRowLegendType.outlineSquare,
        'red',
        layer.label,
      );
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

    const colors = this.eventState?.events?.length
      ? this.mapService.state.colorGradientAlert
      : this.mapService.state.colorGradientNoAlert;
    const getColor = this.getFeatureColorByColorsAndColorThresholds(
      colors,
      colorThreshold,
    );
    const getLabel = this.getLabel(grades, layer, labels);
    let element = '<div>';

    element += this.layerTitle(layer.label, layer.unit);

    const noDataEntryFound = layer.data?.features.find(
      (f) => f.properties?.['indicators'][layer.name] === null,
    );

    element += "<div style='margin-top: 8px'>";
    if (noDataEntryFound) {
      element += this.singleRowLegend(
        SingleRowLegendType.fullSquareGradient,
        this.mapService.state.noDataColor,
        'No data',
      );
    }

    for (let i = 0; i < grades.length; i++) {
      if (grades[i] !== null && (i === 0 || grades[i] > grades[i - 1])) {
        element += this.singleRowLegend(
          SingleRowLegendType.fullSquareGradient,
          getColor(grades[i + 1]),
          getLabel(i),
        );
      }
    }
    element += '</div></div>';

    return element;
  }

  public getWmsLegendString(layer: IbfLayer): string {
    let element = '<div>';
    const typeKey = 'type';
    const legendColor =
      layer.legendColor[this.country.countryCodeISO3]?.[
        this.disasterType.disasterType
      ] ||
      layer.legendColor[this.country.countryCodeISO3] ||
      layer.legendColor;
    const legendType = legendColor[typeKey];
    const valueKey = 'value';
    const value = legendColor[valueKey];

    switch (legendType) {
      case wmsLegendType.exposureLine:
        element += this.layerTitle(layer.label);

        element += this.singleRowLegend(
          SingleRowLegendType.line,
          value[0],
          'Exposed ' + layer.label,
        );

        element += this.singleRowLegend(
          SingleRowLegendType.line,
          value[1],
          'Non-exposed ' + layer.label,
        );
        break;
      case wmsLegendType.exposureSquare:
        element += this.layerTitle(layer.label);

        element += this.singleRowLegend(
          SingleRowLegendType.fullSquare,
          value[0],
          'Exposed ' + layer.label,
        );

        element += this.singleRowLegend(
          SingleRowLegendType.fullSquare,
          value[1],
          'Non-exposed ' + layer.label,
        );
        break;
      case wmsLegendType.gradient:
        element += this.layerTitle(layer.label, layer.unit);
        element += '<ion-row>';
        for (const color of value) {
          element += `<div style="width: 14px; height: 14px; background:${color}"></div>`;
        }
        element += '</ion-row>';

        element += `<ion-row style="margin-top: 4px"><ion-label>Low</ion-label><ion-label style="margin-left: ${this.getWmsGradientCaptionMargin(
          value.length,
        )}px;">High</ion-label></ion-row>`;
        break;
      case wmsLegendType.square:
        element += this.singleRowLegend(
          SingleRowLegendType.fullSquare,
          value[0],
          layer.label,
        );
        break;
      case wmsLegendType.line:
        element += this.singleRowLegend(
          SingleRowLegendType.line,
          value[0],
          layer.label,
        );
        break;
      default:
        break;
    }
    element += '</div>';

    return element;
  }

  private getWmsGradientCaptionMargin(gradientLength: number): number {
    return gradientLength <= 4
      ? (gradientLength - 2) * 14
      : 7 + (gradientLength - 4) * 14;
  }

  private getFeatureColorByColorsAndColorThresholds(
    colors: string[],
    colorThreshold: Record<string, number>,
  ): (feature: number) => string {
    return (feature: number): string => {
      if (
        !colorThreshold[breakKey.break1] ||
        feature <= colorThreshold[breakKey.break1]
      ) {
        return colors[0];
      }

      if (
        !colorThreshold[breakKey.break2] ||
        feature <= colorThreshold[breakKey.break2]
      ) {
        return colors[1];
      }

      if (
        !colorThreshold[breakKey.break3] ||
        feature <= colorThreshold[breakKey.break3]
      ) {
        return colors[2];
      }

      if (
        !colorThreshold[breakKey.break4] ||
        feature <= colorThreshold[breakKey.break4]
      ) {
        return colors[3];
      }

      return colors[4];
    };
  }

  private getLabel = (grades, layer, labels) => (i) => {
    const label = labels ? '  -  ' + labels[i] : '';

    if (layer.colorBreaks) {
      const valueLow = layer.colorBreaks?.[i + 1]?.valueLow;
      const valueHigh = layer.colorBreaks?.[i + 1]?.valueHigh;

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

  private singleRowLegend = (
    type: SingleRowLegendType,
    identifier: string,
    label: string,
  ) => {
    const rowStyle =
      type === SingleRowLegendType.fullSquareGradient
        ? 'style="margin-bottom: 0px; margin-top: 0px; height: 14px;"'
        : 'style="margin-bottom: 8px; margin-top: 8px;"';
    const identifierHeight = type === SingleRowLegendType.pin ? 18 : 14;
    const pinImg =
      type === SingleRowLegendType.pin ? `<img src="${identifier}" />` : '';
    let divStyle = `height: ${identifierHeight}px; width: 14px; margin-right: 4px; `;

    switch (type) {
      case SingleRowLegendType.fullSquare:
      case SingleRowLegendType.fullSquareGradient:
        divStyle += `background: ${identifier}`;
        break;
      case SingleRowLegendType.outlineSquare:
        divStyle += `border: 2px solid ${identifier}`;
        break;
      case SingleRowLegendType.line:
        divStyle += `background: ${identifier}; border-color: #fff; border-style: solid; border-width: 6px 0;`;
        break;
      default:
        break;
    }

    const labelStyle =
      type === SingleRowLegendType.pin && label !== IbfLayerLabel.typhoonTrack
        ? 'style="padding-top: 2px;"'
        : '';

    return `
    <ion-row class="ion-nowrap" ${rowStyle}>
      <div style="${divStyle}">${pinImg}</div>
      <ion-label class="ion-text-wrap" ${labelStyle}>${label}</ion-label>
    </ion-row>
    `;
  };

  private layerTitle(label: string, unit?: string): string {
    return `<ion-row style="margin-top: 8px; margin-bottom: 8px;">
      <ion-label><strong>${label}${
        unit ? ' (' + unit + ')' : ''
      }</strong></ion-label>
    </ion-row>`;
  }
}
