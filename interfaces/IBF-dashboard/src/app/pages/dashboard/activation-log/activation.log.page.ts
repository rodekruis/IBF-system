import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-activation-log',
  templateUrl: './activation.log.page.html',
  styleUrls: ['./activation.log.page.scss'],
})
export class ActivationLogPage implements OnInit, OnDestroy {
  private activationLogSubscription: Subscription;
  public activationLogs: any[] | string;

  constructor(
    private apiService: ApiService,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.activationLog);
    this.activationLogSubscription = this.apiService
      .getActivationLogs()
      .subscribe(this.onFetchActivationLogs);
  }

  ngOnDestroy() {
    this.activationLogSubscription.unsubscribe();
  }

  private onFetchActivationLogs = (data) => {
    this.activationLogs = this.jsonToCsv(data);
    console.log('this.activationLogs: ', this.activationLogs);
  };

  private jsonToCsv(items: any[]): any[] | string {
    if (items.length === 0) {
      return '';
    }
    const cleanValues = (_key, value): any => (value === null ? '' : value);

    const columns = Object.keys(items[0]);

    let rows = items.map((row) =>
      columns
        .map((fieldName) => JSON.stringify(row[fieldName], cleanValues))
        .join(', '),
    );

    rows.unshift(columns.join(', ')); // Add header row

    return rows;
  }
}
