import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LatLng } from 'leaflet';
import { RiverGauge, Station } from 'src/app/models/poi.model';
import {
  ALERT_LEVEL_COLOUR_CLASS,
  ALERT_LEVEL_COLOUR_CONTRAST_CLASS,
  ALERT_LEVEL_LABEL,
  ALERT_LEVEL_TEXT_COLOUR_CLASS,
  AlertLevel,
  eapAlertClassToAlertLevel,
} from 'src/app/types/alert-level';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { LeadTime } from 'src/app/types/lead-time';

@Component({
  selector: 'app-dynamic-point-popup',
  templateUrl: './dynamic-point-popup.component.html',
  standalone: false,
})
export class DynamicPointPopupComponent implements OnInit {
  @Input()
  public layerName: IbfLayerName;

  @Input()
  public riverGauge?: RiverGauge;

  @Input()
  public typhoonTrackPoint?: {
    timestamp: string;
    category: string;
    markerLatLng: LatLng;
    passed: boolean;
  };

  @Input()
  public glofasData?: { station: Station; leadTime: LeadTime };

  public typhoonData: { timestamp: string; category: string };

  public ibfLayerName = IbfLayerName;

  public headerClass = { 'rounded-t-lg p-2': true };
  public footerClass = {
    'rounded-b-lg border-t px-2 py-1 text-center font-semibold': true,
  };

  private alertLevel: AlertLevel = AlertLevel.NONE;

  private allowedLayers = [
    IbfLayerName.gauges,
    IbfLayerName.typhoonTrack,
    IbfLayerName.glofasStations,
  ];

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    if (!this.layerName || !this.allowedLayers.includes(this.layerName)) {
      return;
    }

    if (!this.riverGauge && !this.typhoonTrackPoint && !this.glofasData) {
      return;
    }

    if (this.layerName === IbfLayerName.typhoonTrack) {
      this.typhoonData = {
        timestamp: this.typhoonTrackPoint.timestamp,
        category: this.typhoonTrackPoint.category,
      };

      this.headerClass['bg-ibf-primary'] = true;
      this.headerClass['text-ibf-white'] = true;
    }

    if (
      [IbfLayerName.glofasStations, IbfLayerName.gauges].includes(
        this.layerName,
      )
    ) {
      if (this.layerName === IbfLayerName.gauges) {
        this.alertLevel =
          this.riverGauge.dynamicData?.['water-level-alert-level'] ??
          AlertLevel.NONE;
      } else if (this.layerName === IbfLayerName.glofasStations) {
        if (this.glofasData.station.dynamicData?.eapAlertClass) {
          this.alertLevel =
            eapAlertClassToAlertLevel[
              this.glofasData.station.dynamicData?.eapAlertClass
            ];
        }
      }

      this.headerClass[`bg-${ALERT_LEVEL_COLOUR_CLASS[this.alertLevel]}`] =
        true;

      this.headerClass[
        `text-${ALERT_LEVEL_COLOUR_CONTRAST_CLASS[this.alertLevel]}`
      ] = true;

      this.footerClass[
        'text-' + ALERT_LEVEL_TEXT_COLOUR_CLASS[this.alertLevel]
      ] = true;
    }
  }

  get title(): string {
    if (this.layerName === IbfLayerName.gauges) {
      const header = String(
        this.translateService.instant('map-popups.river-gauge.header'),
      );

      return `${header} ${this.riverGauge.fid} ${this.riverGauge.name}`;
    }

    if (this.layerName === IbfLayerName.typhoonTrack) {
      const hasPassedSuffix = this.typhoonTrackPoint.passed ? ' (passed)' : '';

      return `Typhoon track${hasPassedSuffix}`;
    }

    if (this.layerName === IbfLayerName.glofasStations) {
      return `${this.glofasData.station.stationCode} STATION: ${this.glofasData.station.stationName}`;
    }

    return '';
  }

  get footer(): string {
    if (
      [IbfLayerName.glofasStations, IbfLayerName.gauges].includes(
        this.layerName,
      )
    ) {
      if (
        !this.riverGauge?.dynamicData &&
        !this.glofasData?.station?.dynamicData
      ) {
        // no footer if no dynamic data
        return '';
      }

      return ALERT_LEVEL_LABEL[this.alertLevel];
    }

    if (this.layerName === IbfLayerName.typhoonTrack) {
      const { lat, lng } = this.typhoonTrackPoint.markerLatLng;
      const latAbs = Math.abs(lat).toFixed(4);
      const lngAbs = Math.abs(lng).toFixed(4);
      const latDir = lat > 0 ? 'N' : 'S';
      const lngDir = lng > 0 ? 'E' : 'W';

      return `${latAbs}° ${latDir}, ${lngAbs}° ${lngDir}`;
    }

    return '';
  }
}
