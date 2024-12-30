import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Country, DisasterType } from 'src/app/models/country.model';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.scss'],
  standalone: false,
})
export class LogosComponent implements OnInit {
  public country: Observable<Country>;
  public disasterType: Observable<DisasterType>;

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {}

  ngOnInit() {
    this.country = this.countryService.getCountrySubscription();
    this.disasterType = this.disasterTypeService.getDisasterTypeSubscription();
  }
}
