import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { Country, DisasterType } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

@Component({
  selector: 'app-disaster-type',
  templateUrl: './disaster-type.component.html',
  styleUrls: ['./disaster-type.component.scss'],
})
export class DisasterTypeComponent implements OnInit, OnDestroy {
  public disasterTypes: DisasterType[] = [];
  public disasterTypeMap = DISASTER_TYPES_SVG_MAP;
  public selectedDisasterType: DisasterTypeKey = DisasterTypeKey.floods;

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
    this.selectedDisasterType = disasterType.disasterType;
  }
}
