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

  public typhoonData: { timestamp: string; category: string };

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
        ] ?? this.defautEapAlertClass;
    }

    this.title = this.getTitle();
    this.footerContent = this.getFooterContent();

    switch (this.layerName) {
      case IbfLayerName.glofasStations:
        this.glofasHeaderStyle =
          `background: var(--ion-color-${this.eapAlertClass.color});` +
          `color: var(--ion-color-${this.eapAlertClass.textColor || 'ibf-white'});`;
        this.glofasFooterStyle = `color: var(--ion-color-${
          this.eapAlertClass.textColor || this.eapAlertClass.color
        });`;
        break;
      case IbfLayerName.gauges:
        this.glofasHeaderStyle =
          'background: var(--ion-color-ibf-no-alert-primary);';
        break;
      case IbfLayerName.typhoonTrack:
        this.glofasHeaderStyle = 'background: var(--ion-color-ibf-primary);';
        break;
      default:
        this.glofasHeaderStyle = '';
        this.glofasFooterStyle = '';
    }
  }

  private getTitle(): string {
    switch (this.layerName) {
      case IbfLayerName.gauges: {
        const header = String(
          this.translate.instant('map-popups.river-gauge.header'),
        );
        return `${header} ${this.riverGauge.fid} ${this.riverGauge.name}`;
      }
      case IbfLayerName.typhoonTrack: {
        const hasPassedSuffix = this.typhoonTrackPoint.passed
          ? ' (passed)'
          : '';
        return `Typhoon track${hasPassedSuffix}`;
      }
      case IbfLayerName.glofasStations:
        return `${this.glofasData.station.stationCode} STATION: ${this.glofasData.station.stationName}`;
      default:
        return '';
    }
  }

  private getFooterContent(): string {
    if (this.layerName === IbfLayerName.gauges) {
      const waterLevel = this.riverGauge.dynamicData?.['water-level'];
      const reference = this.riverGauge.dynamicData?.['water-level-reference'];
      if (waterLevel == null) return '';
      const below = String(
        this.translate.instant('map-popups.river-gauge.below'),
      );
      const above = String(
        this.translate.instant('map-popups.river-gauge.above'),
      );
      return waterLevel <= reference ? below : above;
    }

    if (this.layerName === IbfLayerName.typhoonTrack) {
      const { lat, lng } = this.typhoonTrackPoint.markerLatLng;
      const latAbs = Math.abs(lat).toFixed(4);
      const lngAbs = Math.abs(lng).toFixed(4);
      const latDir = lat > 0 ? 'N' : 'S';
      const lngDir = lng > 0 ? 'E' : 'W';
      return `${latAbs}° ${latDir}, ${lngAbs}° ${lngDir}`;
    }

    if (this.layerName === IbfLayerName.glofasStations) {
      return this.eapAlertClass.label;
    }

    return '';
  }
}
