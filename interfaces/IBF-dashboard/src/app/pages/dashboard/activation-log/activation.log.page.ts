import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { ApiService } from 'src/app/services/api.service';
import { DisasterTypeKey } from '../../../types/disaster-type-key';

@Component({
  selector: 'app-activation-log',
  templateUrl: './activation.log.page.html',
  styleUrls: ['./activation.log.page.scss'],
})
export class ActivationLogPage implements OnInit, OnDestroy {
  private countryCodeISO3: string;
  private disasterType: DisasterTypeKey;
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
    private router: Router,
  ) {
    const urlParts = this.router.url.split(';');
    if (urlParts.length > 1) {
      this.countryCodeISO3 = urlParts[1].split('=')[1];
      this.disasterType = urlParts[2].split('=')[1] as DisasterTypeKey;
    }
  }

  ngOnInit() {
    this.analyticsService.logPageView(AnalyticsPage.activationLog);
    this.activationLogSubscription = this.apiService
      .getActivationLogs(this.countryCodeISO3, this.disasterType)
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
