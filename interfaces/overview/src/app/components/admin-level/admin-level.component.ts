import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { AdminLevel } from 'src/app/types/admin-level.enum';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
})
export class AdminLevelComponent {
  private countrySubscription: Subscription;
  public adminLevel = AdminLevel;
  public adminLevelLabel = {};
  private adminLevelNumber: number;
  public adminLayerState: boolean = true;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private mapService: MapService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.adminLevelService.setAdminLevel(country.defaultAdminLevel);
        this.loadAdminLevelLabels();
      });
    this.adminLevelNumber = this.getSelectedAdminLevel();

    this.loadAdminLevelLabels();
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  loadAdminLevelLabels() {
    this.adminLevelLabel = {
      adm1: this.countryService.selectedCountry.adminRegionLabels[0],
      adm2: this.countryService.selectedCountry.adminRegionLabels[1],
      adm3: this.countryService.selectedCountry.adminRegionLabels[2],
      adm4: this.countryService.selectedCountry.adminRegionLabels[3],
    };
  }

  setAdminLevel(adminLevel: number, state: boolean): void {
    if (this.adminLevelNumber === adminLevel) {
      this.mapService.setLayerState(IbfLayerName.adminRegions, state);
      this.adminLayerState = !this.adminLayerState;
    } else {
      this.adminLevelService.setAdminLevel(adminLevel);
    }
  }

  getSelectedAdminLevel() {
    return this.adminLevelService.adminLevel;
  }
}
