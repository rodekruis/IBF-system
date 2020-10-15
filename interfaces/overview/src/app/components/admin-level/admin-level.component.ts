import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Country } from 'src/app/models/country.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { AdminLevel, AdminLevelLabel } from 'src/app/types/admin-level.enum';

@Component({
  selector: 'app-admin-level',
  templateUrl: './admin-level.component.html',
  styleUrls: ['./admin-level.component.scss'],
})
export class AdminLevelComponent {
  private countrySubscription: Subscription;
  public adminLevel = AdminLevel;
  public adminLevelLabel = AdminLevelLabel;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
  ) {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.adminLevelService.setAdminLevel(country.defaultAdminLevel);
      });
  }

  ngOnDestroy() {
    this.countrySubscription.unsubscribe();
  }

  setAdminLevel(adminLevel: number): void {
    this.adminLevelService.setAdminLevel(adminLevel);
  }

  getSelectedAdminLevel() {
    return this.adminLevelService.adminLevel;
  }
}
