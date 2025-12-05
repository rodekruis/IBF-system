import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RiverGauge } from 'src/app/models/poi.model';
import {
  ALERT_LEVEL_COLOUR_CLASS,
  ALERT_LEVEL_COLOUR_CONTRAST_CLASS,
  AlertLevel,
} from 'src/app/types/alert-level';

@Component({
  selector: 'app-river-gauge-popup-content',
  templateUrl: './river-gauge-popup-content.component.html',
  standalone: false,
})
export class RiverGaugePopupContentComponent implements OnInit {
  @Input()
  data!: RiverGauge;

  public current = 0;
  public currentString = '';
  public previous = 0;
  public reference = 0;
  public difference = 0;
  public differenceAbsolute = 0;
  public triggerWidth = 0;
  public barBackgroundColor: string;
  public barTextColor: string;
  public alertLevel: AlertLevel = AlertLevel.NONE;

  constructor(public translate: TranslateService) {}

  ngOnInit(): void {
    if (!this.data?.dynamicData) {
      return;
    }

    const dynamicData = this.data.dynamicData;

    this.current = this.roundTo(Number(dynamicData['water-level']), 2);
    this.currentString = isNaN(this.current) ? '' : String(this.current);
    this.previous = Number(dynamicData['water-level-previous']);

    this.reference = this.roundTo(
      Number(dynamicData['water-level-reference']),
      0,
    );

    this.difference = this.roundTo(this.current - this.previous, 2);
    this.differenceAbsolute = Math.abs(this.difference);

    this.triggerWidth = this.calculateTriggerWidth(
      this.current,
      this.reference,
    );

    const alertLevel =
      dynamicData['water-level-alert-level'] ?? AlertLevel.NONE;

    this.barBackgroundColor = `var(--ion-color-${ALERT_LEVEL_COLOUR_CLASS[alertLevel]})`;

    this.barTextColor = `var(--ion-color-${
      ALERT_LEVEL_COLOUR_CONTRAST_CLASS[alertLevel]
    })`;
  }

  private roundTo(value: number, decimals: number): number {
    if (isNaN(value)) return 0;

    const factor = Math.pow(10, decimals);

    return Math.round(value * factor) / factor;
  }

  private calculateTriggerWidth(current: number, reference: number): number {
    if (reference === 0) return 0;

    const width = Math.round((current / reference) * 100);

    return Math.max(Math.min(width, 115), 0);
  }
}
