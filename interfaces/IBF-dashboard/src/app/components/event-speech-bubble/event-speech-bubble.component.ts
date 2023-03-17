import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { EventSummary } from '../../services/event.service';
import { PlaceCodeService } from '../../services/place-code.service';
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

  constructor(
    private authService: AuthService,
    private placeCodeService: PlaceCodeService,
  ) {}

  ngOnInit() {
    if (this.authService.displayName) {
      this.displayName = this.authService.displayName;
    }
  }

  public selectArea(area) {
    this.placeCodeService.setPlaceCode({
      countryCodeISO3: this.countryCodeISO3,
      placeCodeName: area.name,
      placeCode: area.placeCode,
      placeCodeParentName: area.nameParent,
    });
  }
}
