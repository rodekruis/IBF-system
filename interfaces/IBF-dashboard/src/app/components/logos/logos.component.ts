import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.scss'],
})
export class LogosComponent implements OnInit, OnDestroy {
  private countrySubscription: Subscription;
  public logos: string[] = [];

  constructor(private countryService: CountryService) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    if (country) {
      this.logos = country.countryLogos;
    }
  };
}
