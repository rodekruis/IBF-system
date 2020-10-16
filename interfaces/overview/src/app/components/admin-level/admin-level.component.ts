import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { AdminLevel, AdminLevelLabel } from 'src/app/types/admin-level.enum';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
})
export class AdminLevelComponent {
  private countrySubscription: Subscription;
  public adminLevel = AdminLevel;
  public adminLevelLabel = AdminLevelLabel;
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
      });
    this.adminLevelNumber = this.getSelectedAdminLevel();
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
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
