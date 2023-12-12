import { Component, Input, OnInit } from '@angular/core';
import { EapAlertClass } from '../../../models/country.model';
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
    eapAlertClass: EapAlertClass;
  };

  public barValue: number;
  public triggerWidth: number;
  public barBackgroundColor: string;
  public barTextColor: string;

  ngOnInit(): void {
    if (!this.data) {
      return;
    }

    const difference =
      this.data.station.forecastLevel - this.data.station.triggerLevel;
    const closeMargin = 0.05;
    const tooClose =
      Math.abs(difference) / this.data.station.triggerLevel < closeMargin;

    this.barValue =
      difference === 0 || !tooClose
        ? this.data.station.forecastLevel
        : this.data.station.triggerLevel +
          Math.sign(difference) * this.data.station.triggerLevel * closeMargin;

    this.triggerWidth = Math.max(
      Math.min(
        Math.round((this.barValue / this.data.station.triggerLevel) * 100),
        115,
      ),
      0,
    );

    this.barBackgroundColor = `var(--ion-color-${this.data.eapAlertClass.color})`;
    this.barTextColor = `var(--ion-color-${this.data.eapAlertClass.color}-contrast)`;
  }

  public addComma = (n) => Math.round(n).toLocaleString('en-US');
}
