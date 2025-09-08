import { AfterViewChecked, Component, Input, OnDestroy } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CardColors } from 'src/app/components/chat/chat.component';
import { SetTriggerPopoverComponent } from 'src/app/components/set-trigger-popover/set-trigger-popover.component';
import {
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { User } from 'src/app/models/user/user.model';
import { UserRole } from 'src/app/models/user/user-role.enum';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import {
  ALERT_LEVEL_LABEL,
  AlertLevel,
  Event,
  EventService,
} from 'src/app/services/event.service';
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
  public event: Event;

  @Input()
  public selectedEvent: string;

  @Input()
  public disasterType: DisasterType;

  @Input()
  public countryDisasterSettings: CountryDisasterSettings;

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
  private placeCodeHoverSubscription: Subscription;
  public placeCodeHover: PlaceCode;
  public userRole: UserRole;
  public ALERT_LEVEL_LABEL = ALERT_LEVEL_LABEL;

  constructor(
    private authService: AuthService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private adminLevelService: AdminLevelService,
    private translateService: TranslateService,
    private popoverController: PopoverController,
  ) {}

  ngAfterViewChecked() {
    this.placeCodeHoverSubscription = this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlaceCodeHoverChange);

    this.authService.getAuthSubscription().subscribe(this.onUserChange);
    this.typhoonLandfallText = this.showTyphoonLandfallText(this.event);

    if (this.event) {
      this.event.header = this.getHeader(this.event);

      this.event.mainExposureValueSum = this.getEventMainExposureValue(
        this.event,
        this.mainExposureIndicatorNumberFormat,
      );
    }
  }

  ngOnDestroy() {
    this.placeCodeHoverSubscription.unsubscribe();
  }

  private getEventMainExposureValue(
    event: Event,
    mainExposureIndicatorNumberFormat: NumberFormat,
  ) {
    const sum = event.alertAreas?.reduce(
      (acc, alertArea) => acc + alertArea.mainExposureValue,
      0,
    );

    // NOTE: this is a temporary solution, as this actually needs a weighted average. At least this is better than sum.
    if (mainExposureIndicatorNumberFormat === NumberFormat.perc) {
      return sum / event.alertAreas?.length || 1;
    }

    return sum;
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

  private onUserChange = (user: User): void => {
    if (user) {
      this.userRole = user.userRole;
    }
  };

  public hasSetTriggerPermission(): boolean {
    return [UserRole.Admin, UserRole.LocalAdmin].includes(this.userRole);
  }

  public eventBubbleIsSelected(eventName: string) {
    return (
      eventName === this.eventService.state?.event?.eventName ||
      eventName === this.placeCodeHover?.eventName
    );
  }

  public getHeader(event: Event): string {
    let headerKey = `chat-component.${this.disasterType?.disasterType}.active-event.header`;

    if ((LeadTimeTriggerKey[event.firstLeadTime] as string) === '0') {
      headerKey += '-ongoing';
    }

    if (event.alertLevel !== AlertLevel.TRIGGER) {
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

  public showTyphoonLandfallText(event: Event) {
    if (this.disasterType?.disasterType !== DisasterTypeKey.typhoon || !event) {
      return;
    }

    const ongoingEvent = event.firstLeadTime === LeadTime.hour0;
    const landfallEvent = event.disasterSpecificProperties?.typhoonLandfall;
    const noLandfallYetEvent =
      event.disasterSpecificProperties?.typhoonNoLandfallYet;
    const warningSuffix =
      event.alertLevel === AlertLevel.TRIGGER
        ? ''
        : (this.translateService.instant(
            'chat-component.typhoon.active-event.warning',
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
      { firstLeadTimeDate: event.firstLeadTimeDate },
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
        forecastSource: this.countryDisasterSettings?.forecastSource,
        eapLink: this.countryDisasterSettings?.eapLink,
        adminAreaLabelPlural: this.adminAreaLabelPlural,
        areas: this.areas,
        mainExposureIndicatorNumberFormat:
          this.mainExposureIndicatorNumberFormat,
        hasSetTriggerPermission: this.hasSetTriggerPermission(),
        countryCodeISO3: this.countryCodeISO3,
        disasterType: this.disasterType.disasterType,
        eventName: this.event?.eventName?.split('_')[0],
      },
    });

    await popover.present();
  }
}
