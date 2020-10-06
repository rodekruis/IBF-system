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
          'https://rodekruis.sharepoint.com/:w:/r/sites/510-CRAVK-510/_layouts/15/doc2.aspx?action=embedview&sourcedoc=%7B0FFAA5EF-423C-4F81-A51E-BEA98D06E91C%7D&wdStartOn=18&cid=27882c11-7cad-4848-8b03-2ec0520f6377',
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
