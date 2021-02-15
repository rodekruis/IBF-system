import { Component, Input, OnInit } from '@angular/core';
import { Country } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-about-btn',
  templateUrl: './about-btn.component.html',
  styleUrls: ['./about-btn.component.scss'],
})
export class AboutBtnComponent implements OnInit {
  @Input()
  public btnLabel: string;
  @Input()
  public color: string;

  constructor(private countryService: CountryService) {}

  ngOnInit() {}

  public btnAction() {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        window.open(country.eapLink);
      });
  }
}
