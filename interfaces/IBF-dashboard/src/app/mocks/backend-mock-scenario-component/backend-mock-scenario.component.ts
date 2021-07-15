import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
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
  public countrySubscription: Subscription;

  private disasterType: DisasterType;
  public disasterTypeSubscription: Subscription;

  constructor(
    public countryService: CountryService,
    public apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController,
    private disasterTypeService: DisasterTypeService,
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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
    });
    toast.present();
  }

  public async handleBackendMockScenarioChange(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'mock-scenario-alert',
      header: 'Load Mock Scenario',
      subHeader: 'Current data will be overwritten.',
      message: `Are you sure you want to mock the backend of ${this.country.countryName}?`,
      inputs: [
        {
          name: 'secret',
          type: 'text',
          placeholder: 'Please enter the reset secret',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'No Trigger',
          cssClass: 'no-trigger-scenario-button',
          handler: (data) => {
            this.mockApiRefresh(data.secret, false);
            return false;
          },
        },
        {
          text: 'Trigger',
          cssClass: 'trigger-scenario-button',
          handler: (data) => {
            this.mockApiRefresh(data.secret, true);
            return false;
          },
        },
      ],
    });
    alert.present();
  }

  private mockApiRefresh(secret: string, triggered: boolean) {
    if (secret) {
      this.apiService
        .mockDynamicData(
          secret,
          this.country,
          triggered,
          true,
          this.disasterType,
        )
        .subscribe({
          next: () => window.location.reload(),
          error: () => this.presentToast('Failed to set mock scenario.'),
        });
    } else {
      this.presentToast('Reset secret cannot be empty.');
    }
  }
}
