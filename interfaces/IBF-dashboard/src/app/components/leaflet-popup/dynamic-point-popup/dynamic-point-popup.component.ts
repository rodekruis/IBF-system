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

  public eapAlertClass: EapAlertClass;
  private defautEapAlertClass: EapAlertClass = {
    label: 'No action',
    color: 'ibf-no-alert-primary',
    value: 0,
  };

  public headerClass = { 'rounded-t-lg p-2 text-white': true };
  public footerClass = {
    'rounded-b-lg border-t px-2 py-1 text-center font-semibold': true,
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

      this.headerClass['bg-ibf-primary'] = true;
    }

    if (this.layerName === IbfLayerName.gauges) {
      this.headerClass['bg-ibf-no-alert-primary'] = true;
    }

    if (
      this.layerName === IbfLayerName.glofasStations &&
      this.glofasData.eapAlertClasses
    ) {
      this.eapAlertClass =
        this.glofasData.eapAlertClasses[
          this.glofasData.station.dynamicData?.eapAlertClass
        ] ?? this.defautEapAlertClass;

      this.headerClass['bg-' + this.eapAlertClass.color] = true;

      this.headerClass['text-' + this.eapAlertClass.textColor] =
        !!this.eapAlertClass.textColor;

      this.headerClass['text-ibf-white'] = !this.eapAlertClass.textColor;

      this.footerClass[
        'text-' + this.eapAlertClass.textColor || this.eapAlertClass.color
      ] = true;
    }

    this.title = this.getTitle();
    this.footerContent = this.getFooterContent();
  }

  private getTitle(): string {
    if (this.layerName === IbfLayerName.gauges) {
      const header = String(
        this.translate.instant('map-popups.river-gauge.header'),
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
