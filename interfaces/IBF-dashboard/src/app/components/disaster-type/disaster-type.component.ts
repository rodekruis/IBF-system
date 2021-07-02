import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { Country, DisasterType } from '../../models/country.model';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-disaster-type',
  templateUrl: './disaster-type.component.html',
  styleUrls: ['./disaster-type.component.scss'],
})
export class DisasterTypeComponent {
  public disasterTypes: DisasterType[] = [];

  private countrySubscription: Subscription;

  constructor(
    public disasterTypeService: DisasterTypeService,
    private countryService: CountryService,
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
    if (country) {
      this.disasterTypes = country.disasterTypes;
    }
  };

  public switchDisasterType(disasterType: DisasterType): void {
    this.disasterTypeService.setDisasterType(disasterType);
  }
}
