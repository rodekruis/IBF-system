import { Component, Input, OnInit } from '@angular/core';
import { EapAlertClass, EapAlertClasses } from '../../../models/country.model';
import { Station } from '../../../models/poi.model';
import { LeadTime } from '../../../types/lead-time';

@Component({
  selector: 'app-glofas-station-popup-content',
  templateUrl: './glofas-station-popup-content.component.html',
  styleUrls: ['./glofas-station-popup-content.component.css'],
})
export class GlofasStationPopupContentComponent implements OnInit {
  @Input()
  public data: {
    station: Station;
    leadTime: LeadTime;
    eapAlertClasses: EapAlertClasses;
  };

  public barValue: number;
  public triggerWidth: number;
  public barBackgroundColor: string;
  public barTextColor: string;
  private eapAlertClass: EapAlertClass;

  ngOnInit(): void {
    if (!this.data) {
      return;
    }

    const difference =
      Number(this.data.station.dynamicData.forecastLevel) -
      Number(this.data.station.dynamicData.triggerLevel);
    const closeMargin = 0.05;
    const tooClose =
      Math.abs(difference) / this.data.station.triggerLevel < closeMargin;

    this.barValue =
      difference === 0 || !tooClose
        ? Number(this.data.station.dynamicData.forecastLevel)
        : Number(this.data.station.dynamicData.triggerLevel) +
          Math.sign(difference) *
            Number(this.data.station.dynamicData.triggerLevel) *
            closeMargin;

    this.triggerWidth = Math.max(
      Math.min(
        Math.round(
          (this.barValue / Number(this.data.station.dynamicData.triggerLevel)) *
            100,
        ),
        115,
      ),
      0,
    );

    this.eapAlertClass = this.data.eapAlertClasses[
      this.data.station.dynamicData.eapAlertClass
    ];

    this.barBackgroundColor = `var(--ion-color-${this.eapAlertClass.color})`;
    this.barTextColor = `var(--ion-color-${this.eapAlertClass.color}-contrast)`;
  }

  public addComma = (n) => Math.round(n).toLocaleString('en-US');
}
