import { Component, Input, OnInit } from '@angular/core';
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
    switch (this.countryService.selectedCountry.countryCode) {
      case 'UGA': {
        window.open(
          'https://docs.google.com/document/d/1IiG2ZFasCVE7kmYfqgyrx7SuZWkoYzTvw3LaEt2nl2U/edit#heading=h.35nkun2',
        );
      }
      case 'ZMB': {
        window.open(
          'https://docs.google.com/document/d/18SG6UklAYsY5EkVAINnZUH6D_tvry3Jh479mpVTehRU/edit?ts=5da1dba5#bookmark=id.xa68na3bshzr',
        );
      }
      default: {
        console.log('No methodology available for country');
      }
    }
  }
}
