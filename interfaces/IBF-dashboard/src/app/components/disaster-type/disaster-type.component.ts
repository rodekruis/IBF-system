import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DISASTER_TYPES_SVG_MAP } from 'src/app/config';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { AuthService } from '../../auth/auth.service';
import { Country, DisasterType } from '../../models/country.model';
import { User } from '../../models/user/user.model';
import { CountryService } from '../../services/country.service';
import { PlaceCodeService } from '../../services/place-code.service';

@Component({
  selector: 'app-disaster-type',
  templateUrl: './disaster-type.component.html',
  styleUrls: ['./disaster-type.component.scss'],
})
export class DisasterTypeComponent implements OnInit, OnDestroy {
  public disasterTypesCounter = 0;
  public disasterTypes: DisasterType[] = [];
  private selectedDisasterType: DisasterTypeKey;

  private countrySubscription: Subscription;
  private authSubscription: Subscription;

  private user: User;
  private country: Country;

  constructor(
    public disasterTypeService: DisasterTypeService,
    private countryService: CountryService,
    public eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.authSubscription = this.authService
      .getAuthSubscription()
      .subscribe(this.onUserChange);
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
    this.authSubscription.unsubscribe();
  }

  private onUserChange = (user: User) => {
    this.user = user;
    if (this.user && this.country) {
      this.setupDisasterTypes(this.user, this.country);
    }
  };

  private onCountryChange = (country: Country) => {
    this.country = country;
    if (this.user && this.country) {
      this.setupDisasterTypes(this.user, this.country);
    }
  };

  private setupDisasterTypes = (user: User, country: Country) => {
    if (country) {
      this.disasterTypesCounter = 0;
      this.disasterTypes = country.disasterTypes.filter((d) =>
        user.disasterTypes.includes(d.disasterType),
      );
      this.disasterTypes.sort((a, b) =>
        a.disasterType > b.disasterType ? 1 : -1,
      );
      this.disasterTypes.forEach((disasterType) => {
        this.eventService.getTriggerByDisasterType(
          country.countryCodeISO3,
          disasterType,
          this.onGetDisasterTypeActiveTrigger(this.disasterTypes),
        );
      });
    }
  };

  private onGetDisasterTypeActiveTrigger = (
    disasterTypes: DisasterType[],
  ) => () => {
    this.disasterTypesCounter++;
    if (this.disasterTypesCounter === disasterTypes.length) {
      const activeDisasterType = disasterTypes.find(
        ({ activeTrigger }) => activeTrigger,
      );

      const disasterType = activeDisasterType
        ? activeDisasterType
        : this.disasterTypes[0];
      this.selectedDisasterType = disasterType.disasterType as DisasterTypeKey;
      this.disasterTypeService.setDisasterType(disasterType);
    }
  };

  public switchDisasterType(disasterType: DisasterType): void {
    this.placeCodeService.clearPlaceCode();
    this.placeCodeService.clearPlaceCodeHover();
    this.disasterTypeService.setDisasterType(disasterType);
    this.selectedDisasterType = disasterType.disasterType;
  }

  public isSelectedDisaster(disasterType: string): boolean {
    return this.selectedDisasterType === disasterType;
  }

  public getButtonSvg(
    disasterType: DisasterTypeKey,
    triggered: boolean,
  ): string {
    const buttonStatus = `${
      this.isSelectedDisaster(disasterType) ? 'selected' : 'nonSelected'
    }${triggered ? '' : 'Non'}Triggered`;
    return DISASTER_TYPES_SVG_MAP[disasterType][buttonStatus];
  }
}
