import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { PlaceCode } from '../../models/place-code.model';
import { AdminLevelService } from '../../services/admin-level.service';
import { EventService, EventSummary } from '../../services/event.service';
import { PlaceCodeService } from '../../services/place-code.service';
import { TimelineService } from '../../services/timeline.service';
import { DisasterTypeKey } from '../../types/disaster-type-key';
import { LeadTime, LeadTimeTriggerKey } from '../../types/lead-time';
import { TriggeredArea } from '../../types/triggered-area';

@Component({
  selector: 'app-event-speech-bubble',
  templateUrl: './event-speech-bubble.component.html',
  styleUrls: ['./event-speech-bubble.component.scss'],
})
export class EventSpeechBubbleComponent implements AfterViewChecked, OnDestroy {
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

  public typhoonLandfallText: string;
  public displayName: string;
  public isStopped: boolean;
  private placeCodeHoverSubscription: Subscription;
  public placeCodeHover: PlaceCode;
  public alertClasses: { alertClass: string; areas: TriggeredArea[] }[];

  constructor(
    private authService: AuthService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private timelineService: TimelineService,
    private adminLevelService: AdminLevelService,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {}

  ngAfterViewChecked() {
    if (this.authService.displayName) {
      this.displayName = this.authService.displayName;
    }

    this.alertClasses = this.splitAreasByAlertClass(this.areas);

    this.placeCodeHoverSubscription = this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlaceCodeHoverChange);

    this.typhoonLandfallText = this.showTyphoonLandfallText(this.event);

    if (this.event) {
      this.event['header'] = this.getHeader(this.event);
    }
  }

  ngOnDestroy() {
    this.placeCodeHoverSubscription.unsubscribe();
  }

  public splitAreasByAlertClass(
    areas: TriggeredArea[] = [],
  ): { alertClass: string; areas: TriggeredArea[] }[] {
    const areasByAlertClass = {};

    for (const area of areas) {
      if (!areasByAlertClass[area.alertClass]) {
        areasByAlertClass[area.alertClass] = [];
      }
      areasByAlertClass[area.alertClass].push(area);
    }

    return Object.keys(areasByAlertClass).map((alertClass) => ({
      alertClass: alertClass,
      areas: areasByAlertClass[alertClass],
    }));
  }

  public selectArea(area) {
    this.adminLevelService.zoomInAdminLevel();
    this.placeCodeService.setPlaceCode({
      countryCodeISO3: this.countryCodeISO3,
      placeCodeName: area.name,
      placeCode: area.placeCode,
      placeCodeParentName: area.nameParent,
      adminLevel: area.adminLevel,
      eventName: this.event?.eventName || null,
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

  public getHeader(event: EventSummary): string {
    let headerKey = `chat-component.${this.disasterTypeName}.active-event-active-trigger.header`;
    if (LeadTimeTriggerKey[event.firstLeadTime] === '0') {
      headerKey += '-ongoing';
    }
    if (!event.thresholdReached) {
      headerKey += '-below-trigger';
    }
    const header = this.translateService.instant(headerKey, {
      firstLeadTimeDate: event.firstLeadTimeDate,
      firstTriggerLeadTimeDate: event.firstTriggerLeadTimeDate,
      eventName: event.eventName?.split('_')[0] || this.disasterTypeLabel,
      disasterTypeLabel: this.disasterTypeLabel,
    });
    return header;
  }

  public showTyphoonLandfallText(event: EventSummary) {
    if (this.disasterTypeName !== DisasterTypeKey.typhoon || !event) {
      return;
    }

    const ongoingEvent = event.firstLeadTime === LeadTime.hour0;
    const landfallEvent = event.disasterSpecificProperties?.typhoonLandfall;
    const noLandfallYetEvent =
      event.disasterSpecificProperties?.typhoonNoLandfallYet;

    return this.translateService.instant(
      `chat-component.typhoon.active-event-active-trigger.${
        ongoingEvent ? 'ongoing-event' : 'upcoming-event'
      }.${
        noLandfallYetEvent
          ? 'no-landfall-yet'
          : landfallEvent
          ? 'landfall'
          : 'no-landfall'
      }`,
      {
        firstLeadTimeDate: event.firstLeadTimeDate,
      },
    );
  }

  public showFirstWarningDate(): boolean {
    if (!this.event) {
      return true;
    }

    if (this.disasterTypeName !== DisasterTypeKey.floods) {
      return true;
    }

    if (this.event.firstLeadTime !== this.event.firstTriggerLeadTime) {
      return true;
    }

    return false;
  }

  public getCardColors(): {
    iconColor: string;
    headerTextColor: string;
    borderColor: string;
  } {
    const defaultColors = {
      iconColor: 'var(--ion-color-ibf-black)',
      headerTextColor: 'var(--ion-color-ibf-black)',
      borderColor: null,
    };

    if (
      !this.event ||
      !this.event.disasterSpecificProperties ||
      !this.event.disasterSpecificProperties.eapAlertClass
    ) {
      return defaultColors;
    }

    return {
      iconColor: `var(--ion-color-${this.event.disasterSpecificProperties.eapAlertClass.color})`,
      headerTextColor: `var(--ion-color-${
        this.event.disasterSpecificProperties.eapAlertClass.textColor ||
        this.event.disasterSpecificProperties.eapAlertClass.color
      })`,
      borderColor: `var(--ion-color-${this.event.disasterSpecificProperties.eapAlertClass.color})`,
    };
  }
}
