import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { EventService, EventSummary } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { NumberFormat } from 'src/app/types/indicator-group';
import { LeadTime, LeadTimeTriggerKey } from 'src/app/types/lead-time';
import { TriggeredArea } from 'src/app/types/triggered-area';

@Component({
  selector: 'app-event-speech-bubble',
  templateUrl: './event-speech-bubble.component.html',
  styleUrls: ['./event-speech-bubble.component.scss'],
  standalone: false,
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
  public mainExposureIndicatorLabel: string;
  @Input()
  public mainExposureIndicatorNumberFormat: NumberFormat;

  public typhoonLandfallText: string;
  public displayName: string;
  private placeCodeHoverSubscription: Subscription;
  public placeCodeHover: PlaceCode;

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

    this.placeCodeHoverSubscription = this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlaceCodeHoverChange);

    this.typhoonLandfallText = this.showTyphoonLandfallText(this.event);

    if (this.event) {
      this.event.header = this.getHeader(this.event);
    }
  }

  ngOnDestroy() {
    this.placeCodeHoverSubscription.unsubscribe();
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
    if ((LeadTimeTriggerKey[event.firstLeadTime] as string) === '0') {
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
    }) as string;
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
    ) as string;
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

    if (!this.event) {
      return defaultColors;
    }

    if (!this.event.disasterSpecificProperties) {
      if (!this.event.thresholdReached) {
        return defaultColors;
      }

      return {
        iconColor: 'var(--ion-color-fiveten-red-500)',
        headerTextColor: 'var(--ion-color-fiveten-red-500)',
        borderColor: 'var(--ion-color-fiveten-red-500)',
      };
    }

    if (!this.event.disasterSpecificProperties.eapAlertClass) {
      if (!this.event.thresholdReached) {
        return defaultColors;
      }

      return {
        iconColor: 'var(--ion-color-fiveten-red-500)',
        headerTextColor: 'var(--ion-color-fiveten-red-500)',
        borderColor: 'var(--ion-color-fiveten-red-500)',
      };
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

  public isEventWithForecastClasses(): boolean {
    if (!this.event?.disasterSpecificProperties?.eapAlertClass) {
      return false;
    } else return true;
  }
}
