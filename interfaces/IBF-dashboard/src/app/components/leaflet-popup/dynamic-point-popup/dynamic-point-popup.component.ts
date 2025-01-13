import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LatLng } from 'leaflet';
import { EapAlertClass, EapAlertClasses } from 'src/app/models/country.model';
import { RiverGauge, Station } from 'src/app/models/poi.model';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { LeadTime } from 'src/app/types/lead-time';

@Component({
  selector: 'app-dynamic-point-popup',
  templateUrl: './dynamic-point-popup.component.html',
  styleUrls: ['./dynamic-point-popup.component.scss'],
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
  public glofasData?: {
    station: Station;
    leadTime: LeadTime;
    eapAlertClasses: EapAlertClasses;
  };

  public typhoonData: {
    timestamp: string;
    category: string;
  };

  public ibfLayerName = IbfLayerName;

  public title: string;
  public footerContent: string;

  public glofasHeaderStyle: string;
  public glofasFooterStyle: string;

  public eapAlertClass: EapAlertClass;
  private defautEapAlertClass: EapAlertClass = {
    label: 'No action',
    color: 'ibf-no-alert-primary',
    value: 0,
  };

  private allowedLayers = [
    IbfLayerName.gauges,
    IbfLayerName.typhoonTrack,
    IbfLayerName.glofasStations,
  ];

  constructor(private translate: TranslateService) {}

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
    }

    if (
      this.layerName === IbfLayerName.glofasStations &&
      this.glofasData.eapAlertClasses
    ) {
      this.eapAlertClass =
        this.glofasData.eapAlertClasses[
          this.glofasData.station.dynamicData?.eapAlertClass
        ] || this.defautEapAlertClass;
    }

    this.title = this.getTitle();
    this.footerContent = this.getFooterContent();

    this.glofasHeaderStyle =
      this.layerName === IbfLayerName.glofasStations
        ? `background: var(--ion-color-${
            this.eapAlertClass.color
          });color: var(--ion-color-${
            this.eapAlertClass.textColor || 'ibf-white'
          });`
        : '';

    this.glofasFooterStyle =
      this.layerName === IbfLayerName.glofasStations
        ? `color: var(--ion-color-${
            this.eapAlertClass.textColor || this.eapAlertClass.color
          });`
        : '';
  }

  private getTitle(): string {
    if (this.layerName === IbfLayerName.gauges) {
      return `${this.translate.instant('map-popups.river-gauge.header') as string} ${
        this.riverGauge.fid
      } ${this.riverGauge.name}`;
    }

    if (this.layerName === IbfLayerName.typhoonTrack) {
      return `Typhoon track${this.typhoonTrackPoint.passed ? ' (passed)' : ''}`;
    }

    if (this.layerName === IbfLayerName.glofasStations) {
      return `${this.glofasData.station.stationCode} STATION: ${this.glofasData.station.stationName}`;
    }

    return '';
  }

  private getFooterContent(): string {
    if (this.layerName === IbfLayerName.gauges) {
      return !this.riverGauge.dynamicData?.['water-level']
        ? ''
        : this.riverGauge.dynamicData?.['water-level'] <=
            this.riverGauge.dynamicData?.['water-level-reference']
          ? (this.translate.instant('map-popups.river-gauge.below') as string)
          : (this.translate.instant('map-popups.river-gauge.above') as string);
    }

    if (this.layerName === IbfLayerName.typhoonTrack) {
      const lat = `${Math.abs(this.typhoonTrackPoint.markerLatLng.lat).toFixed(
        4,
      )}° ${this.typhoonTrackPoint.markerLatLng.lat > 0 ? 'N' : 'S'}`;
      const lng = `${Math.abs(this.typhoonTrackPoint.markerLatLng.lng).toFixed(
        4,
      )}° ${this.typhoonTrackPoint.markerLatLng.lng > 0 ? 'E' : 'W'}`;
      return `${lat}, ${lng}`;
    }

    if (this.layerName === IbfLayerName.glofasStations) {
      return this.eapAlertClass.label;
    }

    return '';
  }
}
