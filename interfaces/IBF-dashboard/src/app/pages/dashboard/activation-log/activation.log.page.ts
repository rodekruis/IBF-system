import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
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
        rowsData: any[][];
      }
    | string;

  constructor(
    private apiService: ApiService,
    private analyticsService: AnalyticsService,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.countryCodeISO3 = params.countryCodeISO3;
      this.disasterType = params.disasterType as DisasterTypeKey;
    });
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

  public copyToClipboard() {
    const HEADER_KEY = 'headerData';
    const ROWS_KEY = 'rowsData';
    let tsvContent = this.activationLogs[HEADER_KEY].join('\t') + '\n';
    for (const row of this.activationLogs[ROWS_KEY]) {
      tsvContent += row.join('\t') + '\n';
    }

    navigator.clipboard
      .writeText(tsvContent)
      .then(() =>
        this.presentToast(
          this.translate.instant('activation-page.copy-success'),
          'ibf-primary',
        ),
      )
      .catch(() =>
        this.presentToast(
          this.translate.instant('activation-page.copy-fail'),
          'alert',
        ),
      );
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      color,
      animated: true,
    });

    await toast.present();
  }
}
