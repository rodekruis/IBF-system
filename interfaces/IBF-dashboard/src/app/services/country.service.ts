import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import mockCountry from 'src/app/mocks/country.mock';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { AdminLevel } from 'src/app/types/admin-level';
import { LeadTime } from 'src/app/types/lead-time';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private countrySubject = new BehaviorSubject<Country>(null);
  public activeCountry: Country = mockCountry;
  public countries: Country[] = [];

  constructor() {
    this.countries = [
      {
        countryCode: 'UGA',
        defaultAdminLevel: AdminLevel.adm2,
        countryName: 'Uganda',
        countryLeadTimes: [LeadTime.day7],
        adminRegionLabels: ['Regions', 'Districts', 'Counties', 'Parishes'],
        eapLink:
          'https://docs.google.com/document/d/1IiG2ZFasCVE7kmYfqgyrx7SuZWkoYzTvw3LaEt2nl2U/edit#heading=h.35nkun2',
      },
      {
        countryCode: 'KEN',
        defaultAdminLevel: AdminLevel.adm1,
        countryName: 'Kenya',
        countryLeadTimes: [LeadTime.day7],
        adminRegionLabels: ['Counties', 'Subcounties', 'Wards'],
        eapLink:
          'https://docs.google.com/document/d/1nEfCDx0aV0yBebIjeGHalXMAVUNM8XgR/edit#bookmark=id.jtmxnnw2k1z9',
      },
      {
        countryCode: 'ETH',
        defaultAdminLevel: AdminLevel.adm2,
        countryName: 'Ethiopia',
        countryLeadTimes: [LeadTime.day7],
        adminRegionLabels: ['Regions', 'Zones', 'Woredas'],
        eapLink:
          'https://docs.google.com/document/d/1IQy_1pWvoT50o0ykjJTUclVrAedlHnkwj6QC7gXvk98/edit#bookmark=id.ysn0drq0f4nx',
      },
      {
        countryCode: 'ZMB',
        defaultAdminLevel: AdminLevel.adm2,
        countryName: 'Zambia',
        countryLeadTimes: [LeadTime.day3, LeadTime.day7],
        adminRegionLabels: ['Provinces', 'Districts', 'Wards'],
        eapLink:
          'https://docs.google.com/document/d/18SG6UklAYsY5EkVAINnZUH6D_tvry3Jh479mpVTehRU/edit?ts=5da1dba5#bookmark=id.xa68na3bshzr',
      },
    ];
  }

  getCountrySubscription = (): Observable<Country> => {
    return this.countrySubject.asObservable();
  };

  public selectCountry = (countryCode): void => {
    this.activeCountry = this.countries.find(
      (country) => country.countryCode == countryCode,
    );
    this.countrySubject.next(this.activeCountry);
  };

  public filterCountriesForUser = (user: User): void => {
    if (!user || !user.countries) {
      this.countries = [];
    } else {
      this.countries = this.countries.filter(
        (country) => user.countries.indexOf(country.countryCode) >= 0,
      );
      this.selectCountry(this.countries[0].countryCode);
    }
  };
}
