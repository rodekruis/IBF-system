import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { Country, DisasterType } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { EventService } from 'src/app/services/event.service';


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
    public eventService: EventService
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
    console.log("#####",this.eventService.state.activeTrigger);
  }
}
