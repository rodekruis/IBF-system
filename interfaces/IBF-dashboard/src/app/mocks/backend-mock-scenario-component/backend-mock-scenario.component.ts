import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-backend-mock-scenario',
  templateUrl: './backend-mock-scenario.component.html',
  styleUrls: ['./backend-mock-scenario.component.scss'],
})
export class BackendMockScenarioComponent implements OnInit, OnDestroy {
  private country: Country;
  public countrySubscription: Subscription;

  constructor(
    public countryService: CountryService,
    public apiService: ApiService,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  public async handleBackendMockScenarioChange(): Promise<void> {
    const alert = await this.alertController.create({
      message: `Are you sure you want to mock the backend of ${this.country.countryName}? Any real data will be overwritten. Please enter the reset secret:`,
      inputs: [
        {
          name: 'secret',
          type: 'text',
          label: 'Enter secret:',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            alert.dismiss(true);
            return false;
          },
        },
        {
          text: 'Mock without trigger',
          handler: (data) => {
            this.mockApiRefresh(data.secret, false);
            return false;
          },
        },
        {
          text: 'Mock with trigger',
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
    this.apiService
      .mockDynamicData(secret, this.country.countryCodeISO3, triggered, true)
      .subscribe({
        next: () => window.location.reload(),
      });
  }

  public allowMockScenarios(): boolean {
    let allowMock = false;

    if (this.country) {
      allowMock = ['UGA', 'PHL', 'ZMB'].includes(this.country.countryCodeISO3);
    }
    return allowMock;
  }
}
