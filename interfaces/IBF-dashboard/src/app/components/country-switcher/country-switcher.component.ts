import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import * as fromStore from '../../store';
@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  styleUrls: ['./country-switcher.component.scss'],
})
export class CountrySwitcherComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;
  public country: Country;

  public countries$: Observable<Country[]>;

  constructor(
    public countryService: CountryService,
    private store: Store<fromStore.DashboardState>,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.countries$ = this.store.select(fromStore.getAllCountries);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  public handleCountryChange($event) {
    this.countryService.selectCountry($event.detail.value);
  }
}
