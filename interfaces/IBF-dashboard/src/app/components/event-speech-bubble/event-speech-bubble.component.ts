import { AfterViewChecked, Component, Input, OnDestroy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CardColors } from 'src/app/components/chat/chat.component';
import { SetTriggerPopoverComponent } from 'src/app/components/set-trigger-popover/set-trigger-popover.component';
import { DisasterType, ForecastSource } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { EventService, EventSummary } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { AlertArea } from 'src/app/types/alert-area';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { NumberFormat } from 'src/app/types/indicator-group';
import { LeadTime, LeadTimeTriggerKey } from 'src/app/types/lead-time';

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
  public disasterType: DisasterType;
  @Input()
  public forecastSource: ForecastSource;
  @Input()
  public countryCodeISO3: string;
  @Input()
  public areas: AlertArea[];
  @Input()
  public adminAreaLabelPlural: string;
  @Input()
  public mainExposureIndicatorLabel: string;
  @Input()
  public mainExposureIndicatorNumberFormat: NumberFormat;
  @Input()
  public cardColors: CardColors;

  public typhoonLandfallText: string;
  public displayName: string;
  private placeCodeHoverSubscription: Subscription;
  public placeCodeHover: PlaceCode;

  constructor(
    private authService: AuthService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private adminLevelService: AdminLevelService,
    private translateService: TranslateService,
    private popoverController: PopoverController,
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

  public selectArea(area: AlertArea) {
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
  };

  public eventBubbleIsSelected(eventName: string) {
    return (
      eventName === this.eventService.state?.event?.eventName ||
      eventName === this.placeCodeHover?.eventName
    );
  }

  public getHeader(event: EventSummary): string {
    let headerKey = `chat-component.${this.disasterType?.disasterType}.active-event.header`;
    if ((LeadTimeTriggerKey[event.firstLeadTime] as string) === '0') {
      headerKey += '-ongoing';
    }
    if (!event.forecastTrigger) {
      headerKey += '-below-trigger';
    }
    const header = this.translateService.instant(headerKey, {
      firstLeadTimeDate: event.firstLeadTimeDate,
      firstTriggerLeadTimeDate: event.firstTriggerLeadTimeDate,
      eventName: event.eventName?.split('_')[0] || this.disasterType?.label,
      disasterTypeLabel: this.disasterType?.label,
    }) as string;
    return header;
  }

  public showTyphoonLandfallText(event: EventSummary) {
    if (this.disasterType?.disasterType !== DisasterTypeKey.typhoon || !event) {
      return;
    }

    const ongoingEvent = event.firstLeadTime === LeadTime.hour0;
    const landfallEvent = event.disasterSpecificProperties?.typhoonLandfall;
    const noLandfallYetEvent =
      event.disasterSpecificProperties?.typhoonNoLandfallYet;

    const warningSuffix = event.forecastTrigger
      ? ''
      : (this.translateService.instant(
          `chat-component.typhoon.active-event.warning`,
        ) as string);

    const landfallInfo = this.translateService.instant(
      `chat-component.typhoon.active-event.${
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
    return `${landfallInfo} ${warningSuffix}`;
  }

  public showFirstWarningDate(): boolean {
    if (this.disasterType?.disasterType !== DisasterTypeKey.floods) {
      return false;
    }

    if (this.event.firstLeadTime !== this.event.firstTriggerLeadTime) {
      return true;
    }

    return false;
  }

  public async openSetTriggerPopover(): Promise<void> {
    const popover = await this.popoverController.create({
      component: SetTriggerPopoverComponent,
      animated: true,
      cssClass: 'ibf-popover ibf-popover-large',
      translucent: true,
      showBackdrop: true,
      componentProps: {
        forecastSource: this.forecastSource,
        eventName: this.event.eventName.split('_')[0],
        adminAreaLabelPlural: this.adminAreaLabelPlural,
        areas: this.areas,
        mainExposureIndicatorNumberFormat:
          this.mainExposureIndicatorNumberFormat,
      },
    });

    await popover.present();
  }
}
