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
  public activationLogs:
    | {
        headerData: string[];
        rowsData: any[];
      }
    | string;

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
  };

  private jsonToCsv(
    items: any[],
  ): { headerData: string[]; rowsData: any[] } | string {
    if (items.length === 0) {
      return '';
    }

    const headerData = Object.keys(items[0]);

    const rowsData = items.map((rowData) =>
      headerData.map((fieldName) => rowData[fieldName]),
    );

    return { headerData, rowsData };
  }
}
