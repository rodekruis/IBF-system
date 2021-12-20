import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Country, DisasterType } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';

@Component({
  selector: 'app-backend-mock-scenario',
  templateUrl: './backend-mock-scenario.component.html',
  styleUrls: ['./backend-mock-scenario.component.scss'],
})
export class BackendMockScenarioComponent implements OnInit, OnDestroy {
  private country: Country;
  private countrySubscription: Subscription;

  private disasterType: DisasterType;
  private disasterTypeSubscription: Subscription;

  private backendMockScenarioComponentTranslateNode =
    'dashboard-page.dev-menu.mock-scenario';
  private alertHeaderLabel: string;
  private alertHeaderLabelNode = 'alert-header';
  private alertSubHeaderLabel: string;
  private alertSubHeaderLabelNode = 'alert-sub-header';
  private alertMessage: string;
  private alertMessageNode = 'alert-message';
  private alertInputSecretPlaceholder: string;
  private alertInputSecretPlaceholderNode = 'alert-input-secret-placeholder';
  private alertButtonCancelLabel: string;
  private alertButtonCancelLabelNode = 'alert-button-cancel';
  private alertButtonNoTriggerLabel: string;
  private alertButtonNoTriggerLabelNode = 'alert-button-no-trigger';
  private alertButtonTriggerLabel: string;
  private alertButtonTriggerLabelNode = 'alert-button-trigger';
  private alertErrorApiError: string;
  private alertErrorApiErrorNode = 'alert-error-api-error';
  private alertErrorNoSecret: string;
  private alertErrorNoSecretNode = 'alert-error-no-secret';

  constructor(
    public countryService: CountryService,
    public apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController,
    private disasterTypeService: DisasterTypeService,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
  };

  private onTranslate = (translatedStrings) => {
    this.alertHeaderLabel = translatedStrings[this.alertHeaderLabelNode];
    this.alertSubHeaderLabel = translatedStrings[this.alertSubHeaderLabelNode];
    this.alertMessage = this.translateService.instant(
      `${this.backendMockScenarioComponentTranslateNode}.${this.alertMessageNode}`,
      {
        countryName: this.country.countryName,
      },
    );
    this.alertInputSecretPlaceholder =
      translatedStrings[this.alertInputSecretPlaceholderNode];
    this.alertButtonCancelLabel =
      translatedStrings[this.alertButtonCancelLabelNode];
    this.alertButtonNoTriggerLabel =
      translatedStrings[this.alertButtonNoTriggerLabelNode];
    this.alertButtonTriggerLabel =
      translatedStrings[this.alertButtonTriggerLabelNode];
    this.alertErrorApiError = translatedStrings[this.alertErrorApiErrorNode];
    this.alertErrorNoSecret = translatedStrings[this.alertErrorNoSecretNode];
    this.handleBackendMockScenarioChange();
  };

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
    });
    toast.present();
  }

  public onClickBackendMockScenarioChange = () => {
    this.translateService
      .get(this.backendMockScenarioComponentTranslateNode)
      .subscribe(this.onTranslate);
  };

  private async handleBackendMockScenarioChange(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'mock-scenario-alert',
      header: this.alertHeaderLabel,
      subHeader: this.alertSubHeaderLabel,
      message: this.alertMessage,
      inputs: [
        {
          name: 'secret',
          type: 'text',
          placeholder: this.alertInputSecretPlaceholder,
        },
      ],
      buttons: [
        {
          text: this.alertButtonCancelLabel,
          role: 'cancel',
        },
        {
          text: this.alertButtonNoTriggerLabel,
          cssClass: 'no-trigger-scenario-button',
          handler: (data) => {
            this.mockApiRefresh(data.secret, false, alert);
            return false;
          },
        },
        {
          text: this.alertButtonTriggerLabel,
          cssClass: 'trigger-scenario-button',
          handler: (data) => {
            this.mockApiRefresh(data.secret, true, alert);
            alert.dismiss(true);
            return false;
          },
        },
      ],
    });
    alert.present();
  }

  private mockApiRefresh(
    secret: string,
    triggered: boolean,
    alert: HTMLIonAlertElement,
  ) {
    if (secret) {
      this.apiService
        .mockDynamicData(
          secret,
          this.country,
          triggered,
          true,
          this.disasterType,
          1,
        )
        .subscribe({
          next: () => {
            this.countryService.selectCountry(this.country.countryCodeISO3);
            alert.dismiss(true);
          },
          error: (response) => {
            // Somehow the endpoint returns an error together with the 202 status.. Ignore.
            if (response.status === 202) {
              this.countryService.selectCountry(this.country.countryCodeISO3);
              alert.dismiss(true);
            } else {
              console.log('response: ', response);
              this.presentToast(this.alertErrorApiError);
            }
          },
        });
    } else {
      this.presentToast(this.alertErrorNoSecret);
    }
  }
}
