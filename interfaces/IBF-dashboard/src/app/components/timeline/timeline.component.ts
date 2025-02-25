import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlaceCode } from 'src/app/models/place-code.model';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { TimelineState } from 'src/app/types/timeline-state';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  standalone: false,
})
export class TimelineComponent implements OnInit, OnDestroy {
  private timelineStateSubscription: Subscription;
  private placeCodeHoverSubscription: Subscription;

  public timelineState: TimelineState;
  public placeCodeHover: PlaceCode;

  constructor(
    public timelineService: TimelineService,
    private eventService: EventService,
    private disasterTypeService: DisasterTypeService,
    private placeCodeService: PlaceCodeService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.timelineStateSubscription = this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);

    this.placeCodeHoverSubscription = this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlaceCodeHoverChange);
  }

  ngOnDestroy(): void {
    this.timelineStateSubscription.unsubscribe();
    this.placeCodeHoverSubscription.unsubscribe();
  }

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    this.changeDetectorRef.detectChanges();
  };

  private onPlaceCodeHoverChange = (placeCode: PlaceCode) => {
    if (
      !this.eventService.state.event &&
      this.disasterTypeService?.disasterType?.disasterType !==
        DisasterTypeKey.flashFloods
    ) {
      this.placeCodeHover = placeCode;
      if (this.placeCodeHover) {
        const btns = this.timelineState?.timeStepButtons?.filter((t) =>
          t.eventNames.includes(placeCode.eventName),
        );
        for (const btn of btns) {
          btn.active = true;
        }

        this.changeDetectorRef.detectChanges();
      } else {
        if (this.timelineState?.timeStepButtons) {
          for (const btn of this.timelineState.timeStepButtons) {
            btn.active = false;
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    }
  };
}
