import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-country-switcher',
  templateUrl: './country-switcher.component.html',
  styleUrls: ['./country-switcher.component.scss'],
  standalone: false,
})
export class CountrySwitcherComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;
  public country: Country;

  constructor(
    public countryService: CountryService,
    public router: Router,
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

  public handleCountryChange($event) {
    this.router.navigate(['dashboard', $event.detail.value]);
  }
}
