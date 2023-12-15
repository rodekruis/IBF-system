import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-threshold-bar',
  templateUrl: './threshold-bar.component.html',
  styleUrls: ['./threshold-bar.component.scss'],
})
export class ThresholdBarComponent implements OnInit {
  @Input() public backgroundColor: string;
  @Input() public textColor: string;
  @Input() public barWidth: number;
  @Input() public barValue: string;
  @Input() public thresholdDescription: string;
  @Input() public thresholdValue: number;
  @Input() public thresholdPosition: number; // width percentage to position threshold on bar

  public barBackgroundStyle: string;
  public barThresholdStyle: string;
  public barLevelStyle: string;
  public descriptionStyle: string;
  public valueStyle: string;

  ngOnInit(): void {
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

    this.barBackgroundStyle = this.getBarBackgroundStyle();
    this.barThresholdStyle = this.getBarThresholdStyle();
    this.barLevelStyle = this.getBarLevelStyle();
    this.descriptionStyle = this.getDescriptionStyle();
    this.valueStyle = this.getValueStyle();
  }

  private getBarBackgroundStyle(): string {
    return `
      border-radius: 10px;
      height: 20px;
      background-color: #d4d3d2;
      width: 100%;
    `;
  }

  private getBarThresholdStyle(): string {
    return `
      border-radius:10px 0 0 10px;
      border-right: dashed;
      border-right-width: thin;
      height:20px;
      width: ${this.thresholdPosition}%
    `;
  }

  private getBarLevelStyle(): string {
    return `
      border-radius:10px;
      height:20px;
      line-height:20px;
      background-color:${this.backgroundColor};
      color:${this.textColor};
      text-align:center;
      white-space: nowrap;
      min-width: 15%;
      width:${this.barWidth}%
    `;
  }

  private getDescriptionStyle(): string {
    return `
      height:20px;
      background-color:none;
      border-right: dashed;
      border-right-width: thin;
      float: left; width: ${this.thresholdPosition}%;
      padding-top: 5px;
      margin-bottom:10px;
      text-align: right;
      padding-right: 2px`;
  }

  private getValueStyle(): string {
    return `
    height:20px;
    background-color:none;
    margin-left: ${this.thresholdPosition + 1}%;
    text-align: left;
    width: 20%;
    padding-top: 5px;
    margin-bottom:10px
    `;
  }
}
