import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-threshold-bar',
  templateUrl: './threshold-bar.component.html',
  standalone: false,
})
export class ThresholdBarComponent implements OnInit {
  @Input() public backgroundColor: string;
  @Input() public textColor: string;
  @Input() public barWidth: number;
  @Input() public barValue: number;
  @Input() public thresholdDescription: string;
  @Input() public thresholdValue: number;
  @Input() public unit?: string;
  @Input() public thresholdPosition: number; // width percentage to position threshold on bar

  ngOnInit() {
    if (
      !this.backgroundColor ||
      !this.textColor ||
      !this.thresholdDescription ||
      !this.thresholdPosition ||
      this.barWidth === null ||
      this.barWidth === undefined ||
      this.barValue === null ||
      this.barValue === undefined ||
      this.thresholdValue === null ||
      this.thresholdValue === undefined
    ) {
      return;
    }
  }

  public addComma = (n) => Math.round(n).toLocaleString('en-US'); // TODO: check if en-US can be removed
}
