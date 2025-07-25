import { Component, Input, OnInit } from '@angular/core';
import { EapAlertClass, EapAlertClasses } from 'src/app/models/country.model';
import { Station } from 'src/app/models/poi.model';
import { LeadTime } from 'src/app/types/lead-time';

@Component({
  selector: 'app-glofas-station-popup-content',
  templateUrl: './glofas-station-popup-content.component.html',
  standalone: false,
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
  private defautEapAlertClass: EapAlertClass = {
    label: 'No action',
    color: 'ibf-no-alert-primary',
    value: 0,
  };

  ngOnInit(): void {
    if (!this.data) {
      return;
    }

    const difference =
      Number(this.data.station.dynamicData?.forecastLevel) -
      Number(this.data.station.dynamicData?.triggerLevel);
    const closeMargin = 0.05;
    const triggerLevel = Number(
      this.data.station.dynamicData?.triggerLevel ?? 0,
    );
    const tooClose = Math.abs(difference) / triggerLevel < closeMargin;
    const forecastLevel = Number(
      this.data.station.dynamicData?.forecastLevel ?? 0,
    );

    if (difference === 0 || !tooClose) {
      this.barValue = forecastLevel;
    } else {
      this.barValue =
        triggerLevel + Math.sign(difference) * triggerLevel * closeMargin;
    }

    this.triggerWidth = Math.max(
      Math.min(
        Math.round(
          (this.barValue /
            Number(this.data.station.dynamicData?.triggerLevel)) *
            100,
        ),
        115,
      ),
      0,
    );

    this.eapAlertClass =
      this.data.eapAlertClasses[this.data.station.dynamicData?.eapAlertClass] ||
      this.defautEapAlertClass;

    this.barBackgroundColor = `var(--ion-color-${this.eapAlertClass.color})`;

    this.barTextColor = `var(--ion-color-${
      this.eapAlertClass.textColor || 'ibf-white'
    })`;
  }

  public getLeadTimeString(): string {
    if (!this.data?.leadTime) {
      return '';
    }

    const [value, unit] = this.data.leadTime.split('-');

    return `${value} ${unit}${Number(value) === 1 ? '' : 's'}`;
  }
}
