import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.scss'],
})
export class LogosComponent {
  private countrySubscription: Subscription;
  public countryCode: string;
  public logos: any[];

  constructor(private countryService: CountryService) {
    this.logos = [
      {
        countryCode: 'UGA',
        src: 'UGA-unma.png',
      },
      {
        countryCode: 'UGA',
        src: 'UGA-government.jpg',
      },
      {
        countryCode: 'UGA',
        src: 'UGA-urcs.svg',
      },
      {
        countryCode: 'ZMB',
        src: 'ZMB-warma.png',
      },
      {
        countryCode: 'ZMB',
        src: 'ZMB-government.svg',
      },
      {
        countryCode: 'ZMB',
        src: 'ZMB-zrcs.png',
      },
      // This img is somehow not found, even though present
      // {
      //   countryCode: 'ZMB',
      //   src: 'ZMB-zmd.png'
      // },
      {
        countryCode: 'KEN',
        src: 'KEN-krcs.png',
      },
      {
        countryCode: 'ETH',
        src: 'ETH-ercs.png',
      },
    ];

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country) => {
        if (country) {
          this.countryCode = country.countryCode;
        }
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }
}
