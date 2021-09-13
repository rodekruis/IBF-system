import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { Country, DisasterType } from '../../models/country.model';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-disaster-type',
  templateUrl: './disaster-type.component.html',
  styleUrls: ['./disaster-type.component.scss'],
})
export class DisasterTypeComponent implements OnInit, OnDestroy {
  public disasterTypes: DisasterType[] = [];
  public disasterTypeMap = DISASTER_TYPES_SVG_MAP;
  public selectedDisasterType: DisasterTypeKey;

  private countrySubscription: Subscription;

  constructor(
    public disasterTypeService: DisasterTypeService,
    private countryService: CountryService,
    public eventService: EventService,
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
      this.disasterTypes = country.disasterTypes
      this.disasterTypes.forEach((disasterType) => {
        this.eventService.getTriggerByDisasterType(
          country.countryCodeISO3,
          disasterType,
        );
      });
      setTimeout(() => {
        const floodDisasterType = country.disasterTypes.find((item) => {
          return item.disasterType === DisasterTypeKey.floods
        })
        const activeDisasterTypes = country.disasterTypes.filter((item) => {
          return item.activeTrigger
        })
        const nonActiveDisasterTypes = country.disasterTypes.filter((item) => {
          return !item.activeTrigger
        })
        if(floodDisasterType.activeTrigger) {
          const index = activeDisasterTypes.findIndex((item) => {
            return item.disasterType === DisasterTypeKey.floods
          })
          activeDisasterTypes.splice(index, 1)
          activeDisasterTypes.unshift(floodDisasterType)
        } else {
          const index = nonActiveDisasterTypes.findIndex((item) => {
            return item.disasterType === DisasterTypeKey.floods
          })
          nonActiveDisasterTypes.splice(index, 1)
          nonActiveDisasterTypes.unshift(floodDisasterType)
        }
        const sortedDisasterTypes = [...activeDisasterTypes, ...nonActiveDisasterTypes]
        this.disasterTypes = sortedDisasterTypes;
        const activeDisasterType = this.disasterTypes.find(item => item.activeTrigger)
        if (activeDisasterType){
          this.selectedDisasterType = DisasterTypeKey[activeDisasterType.disasterType]
          this.disasterTypeService.setDisasterType(activeDisasterType)
        } else {
          this.selectedDisasterType = this.disasterTypes[0].disasterType;
        }
      }, 2000)
    }
  };

  public switchDisasterType(disasterType: DisasterType): void {
    this.disasterTypeService.setDisasterType(disasterType);
    this.selectedDisasterType = disasterType.disasterType;
  }
}
