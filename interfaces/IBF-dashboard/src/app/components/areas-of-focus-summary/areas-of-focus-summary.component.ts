import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlaceCode } from 'src/app/models/place-code.model';
import { ApiService } from 'src/app/services/api.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';

@Component({
  selector: 'app-areas-of-focus-summary',
  templateUrl: './areas-of-focus-summary.component.html',
  styleUrls: ['./areas-of-focus-summary.component.scss'],
})
export class AreasOfFocusSummaryComponent implements OnDestroy {
  private eapActionSubscription: Subscription;
  private placeCodeSubscription: Subscription;

  public areasOfFocus: any[];
  public triggeredAreas: any[];
  public trigger: boolean;

  constructor(
    private eapActionsService: EapActionsService,
    private apiService: ApiService,
    public eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe((newAreas) => {
        this.triggeredAreas = newAreas;
        this.calcActionStatus(this.triggeredAreas);
      });

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe((placeCode: PlaceCode) => {
        if (placeCode) {
          const filteredAreas = this.triggeredAreas.filter(
            (area) => area.placeCode === placeCode.placeCode,
          );
          this.calcActionStatus(filteredAreas);
        } else {
          this.calcActionStatus(this.triggeredAreas);
        }
      });

    this.eventService.getTrigger();
  }

  ngOnDestroy() {
    this.eapActionSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
  }

  calcActionStatus(triggeredAreas): void {
    // Get areas of focus from db
    this.apiService.getAreasOfFocus().subscribe((areasOfFocus) => {
      this.areasOfFocus = areasOfFocus;

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
      this.changeDetectorRef.detectChanges();
    });
  }
}
