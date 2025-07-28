import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-typhoon-trackpoint-popup-content',
  templateUrl: './typhoon-trackpoint-popup-content.component.html',
  styleUrls: ['./typhoon-trackpoint-popup-content.component.scss'],
  standalone: false,
})
export class TyphoonTrackpointPopupContentComponent implements OnInit, OnChanges {
  @Input()
  public data: { timestamp: string; category: string };

  public dateAndTime: string;
  public category: string;
  public iconColor: string;

  constructor(public translate: TranslateService) {}

  ngOnInit(): void {
    this.updateContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input property changes for web component compatibility
    if (changes['data']) {
      this.updateContent();
    }
  }

  private updateContent(): void {
    if (!this.data) {
      return;
    }

    this.dateAndTime = this.getDateAndTime();
    this.category = this.data.category;
  }

  private getDateAndTime() {
    return DateTime.fromISO(this.data.timestamp).toFormat(
      'ccc, dd LLLL, HH:mm',
    );
  }
}
