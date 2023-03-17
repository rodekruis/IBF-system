import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { PlaceCode } from '../../models/place-code.model';
import { EventService, EventSummary } from '../../services/event.service';
import { PlaceCodeService } from '../../services/place-code.service';
import { TimelineService } from '../../services/timeline.service';
import { DisasterTypeKey } from '../../types/disaster-type-key';
import { TriggeredArea } from '../../types/triggered-area';

@Component({
  selector: 'app-event-speech-bubble',
  templateUrl: './event-speech-bubble.component.html',
  styleUrls: ['./event-speech-bubble.component.scss'],
})
export class EventSpeechBubbleComponent implements OnInit {
  @Input()
  public type: string;

  @Input()
  public event: EventSummary;

  @Input()
  public selectedEvent: string;

  @Input()
  public disasterTypeLabel: string;

  @Input()
  public disasterTypeName: DisasterTypeKey;

  @Input()
  public typhoonLandfallText: string;

  @Input()
  public forecastInfo: string[];

  @Input()
  public countryCodeISO3: string;

  @Input()
  public clearOutMessage: string;

  @Input()
  public areas: TriggeredArea[];

  @Input()
  public adminAreaLabelPlural: string;

  @Input()
  public actionIndicatorLabel: string;

  @Input()
  public actionIndicatorNumberFormat: string;

  public displayName: string;

  public isStopped: boolean;

  private placeCodeHoverSubscription: Subscription;
  public placeCodeHover: PlaceCode;

  constructor(
    private authService: AuthService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private timelineService: TimelineService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.authService.displayName) {
      this.displayName = this.authService.displayName;
    }

    this.placeCodeHoverSubscription = this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlaceCodeHoverChange);
  }

  ngOnDestroy() {
    this.placeCodeHoverSubscription.unsubscribe();
  }

  public selectArea(area) {
    this.placeCodeService.setPlaceCode({
      countryCodeISO3: this.countryCodeISO3,
      placeCodeName: area.name,
      placeCode: area.placeCode,
      placeCodeParentName: area.nameParent,
    });
  }

  private onPlaceCodeHoverChange = (placeCodeHover: PlaceCode) => {
    this.placeCodeHover = placeCodeHover;
    if (!this.eventService.state?.event) {
      if (this.placeCodeHover) {
        const btn = this.timelineService.state?.timeStepButtons?.find(
          (t) => t.eventName === this.placeCodeHover.eventName,
        );
        if (btn) {
          btn.active = true;
        }

        this.changeDetectorRef.detectChanges();
      } else {
        if (this.timelineService.state?.timeStepButtons) {
          for (const btn of this.timelineService.state.timeStepButtons) {
            btn.active = false;
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    }
  };

  public eventBubbleIsSelected(eventName: string) {
    return (
      eventName === this.eventService.state?.event?.eventName ||
      eventName === this.placeCodeHover?.eventName
    );
  }
}
