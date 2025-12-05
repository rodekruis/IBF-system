import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TypeAheadComponent } from 'src/app/components/type-ahead/type-ahead.component';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  standalone: false,
})
export class CountrySwitcherComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;
  public country: Country;
  public countries: Country[] = [];

  constructor(
    private countryService: CountryService,
    private popoverController: PopoverController,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.countryService.getCountries().subscribe((countries) => {
      this.countries = countries;
    });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  public async showUserCountries(event: Event) {
    const target = (event.target as HTMLElement).closest('ion-item');
    const popover = await this.popoverController.create({
      component: TypeAheadComponent,
      componentProps: {
        enableSearch: this.countries.length > 8, // size 8 based on height of type-ahead
        items: this.countries.map(({ countryName, countryCodeISO3 }) => ({
          label: countryName,
          value: countryCodeISO3,
        })),
        selectedItems: this.country?.countryCodeISO3,
        selectionChange: {
          emit: (countryCodeISO3: string) => {
            this.countryService.selectCountry(countryCodeISO3);
          },
        },
        selectionCancel: { emit: () => popover.dismiss() },
      },
      event: Object.assign({}, event, { target }),
      mode: 'ios',
      alignment: 'center',
      side: 'bottom',
      size: 'cover',
      dismissOnSelect: false,
      showBackdrop: false,
    });

    await popover.present();
  }
}
