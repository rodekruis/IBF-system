import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';

@Component({
  selector: 'app-aof-summary',
  templateUrl: './aof-summary.component.html',
  styleUrls: ['./aof-summary.component.scss'],
})
export class AofSummaryComponent implements OnInit {
  private eapActionSubscription: Subscription;
  public areasOfFocus: any[];

  constructor(
    private eapActionsService: EapActionsService,
    private apiService: ApiService,
  ) {
    // this.areasOfFocus = [
    //   {
    //     name: 'shelter',
    //     label: 'Shelter',
    //     icon: 'Shelter.svg',
    //     count: 0,
    //     countChecked: 0,
    //   },
    //   {
    //     name: 'wash',
    //     label: 'WASH',
    //     icon: 'Water-Sanitation-and-Hygiene.svg',
    //     count: 0,
    //     countChecked: 0,
    //   },
    // ]

    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe((newAreas) => {
        const triggeredAreas = newAreas;
        this.calcActionStatus(triggeredAreas);
      });
  }

  ngOnInit() {}

  async calcActionStatus(triggeredAreas) {
    // Get areas of focus from db
    this.areasOfFocus = await this.apiService.getAreasOfFocus();

    // Start calculation only when last area has eapActions attached to it
    if (triggeredAreas[triggeredAreas.length - 1].eapActions) {
      // For each area of focus ..
      this.areasOfFocus.forEach((aof) => {
        aof.count = 0;
        aof.countChecked = 0;
        // Look at each triggered area ..
        triggeredAreas.forEach((area) => {
          // And at each action within the area ..
          area.eapActions.forEach((action) => {
            // And count the total # of (checked) tasks this way
            if (aof.id === action.aof) {
              aof.count += 1;
              if (action.checked) aof.countChecked += 1;
            }
          });
        });
      });
    }
  }
}
