import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Country } from 'src/app/models/country.model';
import { User } from 'src/app/models/user/user.model';
import { ApiService } from 'src/app/services/api.service';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private countrySubject = new BehaviorSubject<Country>(null);
  public countries: Country[] = [];
  // COMMENTED OUT: All programmatic country logic removed - using user access settings instead

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params?.['countryCodeISO3']) {
        this.apiService.getCountries(null, true).subscribe((countries) => {
          this.countries = countries;
          this.selectCountry(params?.['countryCodeISO3']);
        });
      } else {
        // MODIFIED: Always use auth-based selection, ignore programmatic country
        // Use user access settings to determine default country (first in accessible list)
        console.log('🎯 CountryService: Constructor - using auth-based country selection');
        this.authService.getAuthSubscription().subscribe(this.onUserChange);
      }
    });
  }

  private onUserChange = (user: User) => {
    if (user) {
      // COMMENTED OUT: Programmatic country logic - using user access settings instead
      // Don't override programmatic country selection when user auth changes
      // if (this.programmaticCountryCode) {
      //   console.log(`🎯 CountryService: User changed but programmatic country ${this.programmaticCountryCode} is set, not changing country`);
      //   return;
      // }
      console.log('🎯 CountryService: User changed, getting countries by user');
      this.getCountriesByUser(user);
    }
  };

  public getCountriesByUser(user: User): void {
    this.apiService
      .getCountries(user.countries.join(','))
      .subscribe(this.onCountriesByUser(user));
  }

  public getAllCountries(): Observable<Country[]> {
    return this.apiService.getCountries(null, true);
  }

  getCountrySubscription = (): Observable<Country> => {
    return this.countrySubject.asObservable();
  };

  private onCountriesByUser = (user) => (countries) => {
    this.countries = countries;
    this.filterCountriesByUser(user);
  };

  private filterCountryByCountryCodeISO3 = (countryCodeISO3) => (country) =>
    country.countryCodeISO3 === countryCodeISO3;

  private filterCountryByUser = (user: User) => (country) =>
    user.countries.includes(country.countryCodeISO3);

  public selectCountry = (countryCodeISO3: string): void => {
    this.countrySubject.next(
      this.countries.find(this.filterCountryByCountryCodeISO3(countryCodeISO3)),
    );
  };

  public filterCountriesByUser(user: User): void {
    if (!user?.countries) {
      this.countries = [];
    } else {
      this.countries = this.countries
        .filter(this.filterCountryByUser(user))
        .sort((a, b) => (a.countryName > b.countryName ? 1 : -1));
      
      // COMMENTED OUT: Programmatic country logic - using user access settings instead
      // Don't override programmatic country selection
      // if (this.programmaticCountryCode) {
      //   console.log(`🎯 CountryService: Keeping programmatic country ${this.programmaticCountryCode}, not selecting first user country`);
      //   // Verify the programmatic country is still in the filtered list
      //   const programmaticCountryExists = this.countries.find(c => c.countryCodeISO3 === this.programmaticCountryCode);
      //   if (!programmaticCountryExists) {
      //     console.warn(`⚠️ CountryService: Programmatic country ${this.programmaticCountryCode} not in user's accessible countries`);
      //     console.warn('Available countries:', this.countries.map(c => c.countryCodeISO3));
      //   }
      //   return; // Don't change the current selection
      // }
      
      if (this.countries.length > 0) {
        console.log(`🎯 CountryService: Selecting first user country: ${this.countries[0].countryCodeISO3}`);
        this.selectCountry(this.countries[0].countryCodeISO3);
      }
    }
  }

  /**
   * COMMENTED OUT: Programmatically set a country code for embedded mode
   * This will be used instead of user-based country selection
   */
  public setProgrammaticCountry(countryCodeISO3: string): void {
    // COMMENTED OUT: Programmatic country logic - using user access settings instead
    console.log(`🎯 CountryService: setProgrammaticCountry called with ${countryCodeISO3} - IGNORING (using user access instead)`);
    // this.programmaticCountryCode = countryCodeISO3;
    
    // If countries are already loaded, select immediately
    // if (this.countries.length > 0) {
    //   const targetCountry = this.countries.find(country => 
    //     country.countryCodeISO3 === this.programmaticCountryCode
    //   );
    //   
    //   if (targetCountry) {
    //     console.log(`✅ CountryService: Countries already loaded, selecting ${targetCountry.countryName} immediately`);
    //     this.selectCountry(this.programmaticCountryCode);
    //     return;
    //   }
    // }
    
    // Otherwise load countries first
    // this.loadAndSelectProgrammaticCountry();
  }

  /**
   * COMMENTED OUT: Load all countries and select the programmatically set one
   */
  private loadAndSelectProgrammaticCountry(): void {
    // COMMENTED OUT: Programmatic country logic - using user access settings instead
    console.log('🎯 CountryService: loadAndSelectProgrammaticCountry called - IGNORING (using user access instead)');
    // if (!this.programmaticCountryCode) {
    //   console.warn('⚠️ CountryService: No programmatic country code set');
    //   return;
    // }

    // this.apiService.getCountries(null, true).subscribe((countries) => {
    //   this.countries = countries;
    //   const targetCountry = countries.find(country => 
    //     country.countryCodeISO3 === this.programmaticCountryCode
    //   );
    //   
    //   if (targetCountry) {
    //     console.log(`✅ CountryService: Found and selecting country ${targetCountry.countryName} (${this.programmaticCountryCode})`);
    //     this.selectCountry(this.programmaticCountryCode);
    //   } else {
    //     console.error(`🚨 CountryService: Country ${this.programmaticCountryCode} not found in available countries`);
    //     console.log('Available countries:', countries.map(c => c.countryCodeISO3));
    //   }
    // });
  }

  /**
   * COMMENTED OUT: Clear programmatic country setting and revert to user-based selection
   */
  public clearProgrammaticCountry(): void {
    // COMMENTED OUT: Programmatic country logic - using user access settings instead
    console.log('🔄 CountryService: clearProgrammaticCountry called - IGNORING (using user access instead)');
    // this.programmaticCountryCode = null;
    // Re-subscribe to auth changes
    // this.authService.getAuthSubscription().subscribe(this.onUserChange);
  }
}
