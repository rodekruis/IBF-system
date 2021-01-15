import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { AdminLevel, AdminLevelLabel } from 'src/app/types/admin-level.enum';
import { IbfLayerGroup, IbfLayerName } from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
})
export class AdminLevelComponent {
  private countrySubscription: Subscription;
  public adminLevel = AdminLevel;
  public adminLevelLabel: AdminLevelLabel;
  private adminLevelNumber: number;

  constructor(
    private countryService: CountryService,
    public adminLevelService: AdminLevelService,
    private mapService: MapService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        if (country) {
          this.adminLevelService.setAdminLevel(country.defaultAdminLevel);
          this.loadAdminLevelLabels();
        }
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
      this.mapService.updateLayer(IbfLayerName.adminRegions, state, true);
      const activeLayerName = this.mapService.layers.find(
        (l) => l.active && l.group === IbfLayerGroup.aggregates,
      )?.name;
      if (activeLayerName) {
        this.mapService.updateLayer(IbfLayerName[activeLayerName], state, true);
        this.mapService.activeLayerName = activeLayerName;
      } else if (this.mapService.activeLayerName) {
        this.mapService.updateLayer(
          IbfLayerName[this.mapService.activeLayerName],
          state,
          true,
        );
      }
      this.adminLevelService.adminLayerState = !this.adminLevelService
        .adminLayerState;
    } else {
      this.adminLevelService.setAdminLevel(adminLevel);
    }
  }

  getSelectedAdminLevel() {
    return this.adminLevelService.adminLevel;
  }
}
