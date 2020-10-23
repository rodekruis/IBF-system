import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-areas-of-focus-summary',
  templateUrl: './areas-of-focus-summary.component.html',
  styleUrls: ['./areas-of-focus-summary.component.scss'],
})
export class AreasOfFocusSummaryComponent implements OnInit {
  private eapActionSubscription: Subscription;
  public areasOfFocus: any[];
  public triggeredAreas: any[];
  public trigger: boolean;

  constructor(
    private eapActionsService: EapActionsService,
    private apiService: ApiService,
    public eventService: EventService,
  ) {
    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe((newAreas) => {
        this.triggeredAreas = newAreas;
        this.calcActionStatus(this.triggeredAreas);
      });

    this.eventService.getTrigger();
  }

  ngOnInit() {}

  async calcActionStatus(triggeredAreas) {
    // Get areas of focus from db
    this.areasOfFocus = await this.apiService.getAreasOfFocus();

    // Start calculation only when last area has eapActions attached to it
    if (triggeredAreas[triggeredAreas.length - 1]?.eapActions) {
      // For each area of focus ..
      this.areasOfFocus.forEach((areaOfFocus) => {
        areaOfFocus.count = 0;
        areaOfFocus.countChecked = 0;
        // Look at each triggered area ..
        triggeredAreas.forEach((area) => {
          // And at each action within the area ..
          area.eapActions.forEach((action) => {
            // And count the total # of (checked) tasks this way
            if (areaOfFocus.id === action.aof) {
              areaOfFocus.count += 1;
              if (action.checked) areaOfFocus.countChecked += 1;
            }
          });
        });
      });
    }
  }
}
