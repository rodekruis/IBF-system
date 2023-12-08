import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RiverGauge } from '../../../models/poi.model';

@Component({
  selector: 'app-river-gauge-popup-content',
  templateUrl: './river-gauge-popup-content.component.html',
  styleUrls: ['./river-gauge-popup-content.component.scss'],
})
export class RiverGaugePopupContentComponent implements OnInit {
  @Input()
  data: RiverGauge;

  public current: number;
  public currentString: string;
  public previous: number;
  public reference: number;
  public difference: number;
  public differenceAbsolute: number;
  public triggerWidth: number;

  constructor(public translate: TranslateService) {}
  ngOnInit(): void {
    if (!this.data) {
      return;
    }

    this.current = Number(this.data.dynamicData['water-level']);
    this.currentString = String(this.current);
    this.previous = Number(this.data.dynamicData['water-level-previous']);
    this.reference = Number(this.data.dynamicData['water-level-reference']);
    this.difference = this.current - this.previous;
    this.differenceAbsolute = Math.abs(this.difference);

    this.triggerWidth = Math.max(
      Math.min(Math.round((this.current / this.reference) * 100), 115),
      0,
    );
  }
}
