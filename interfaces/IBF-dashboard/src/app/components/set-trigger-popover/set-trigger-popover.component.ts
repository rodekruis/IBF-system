import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { ActionResultPopoverComponent } from 'src/app/components/action-result-popover/action-result-popover.component';
import { ForecastSource } from 'src/app/models/country.model';
import { ApiService } from 'src/app/services/api.service';
import { EventService } from 'src/app/services/event.service';
import { AlertArea } from 'src/app/types/alert-area';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { NumberFormat } from 'src/app/types/indicator-group';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-set-trigger-popover',
  templateUrl: './set-trigger-popover.component.html',
  styleUrls: ['./set-trigger-popover.component.scss'],
  standalone: false,
})
export class SetTriggerPopoverComponent {
  @Input()
  public eapLink: string;
  @Input()
  public forecastSource: ForecastSource;
  @Input()
  public adminAreaLabelPlural: string;
  @Input()
  public areas: AlertArea[];
  @Input()
  public mainExposureIndicatorNumberFormat: NumberFormat;
  @Input()
  public hasSetTriggerPermission: boolean;
  @Input()
  public countryCodeISO3: string;
  @Input()
  public disasterType: DisasterTypeKey;
  @Input()
  public eventName: string;

  public popoverStep = 'select-areas'; // 'select-areas' | 'confirm'
  public selectedAreas: Record<string, boolean> = {};
  public understood = false;
  public supportEmailAddress = environment.supportEmailAddress;

  constructor(
    private popoverController: PopoverController,
    private apiService: ApiService,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService,
    private eventService: EventService,
  ) {}

  getCheckedCount(): number {
    return Object.values(this.selectedAreas).filter((checked) => checked)
      .length;
  }

  public closePopover(): void {
    void this.popoverController.dismiss(null, 'cancel');
  }

  public isContinueDisabled(): boolean {
    return !Object.values(this.selectedAreas).some((value) => value);
  }

  public isSubmitDisabled(): boolean {
    return !this.understood;
  }

  public continueToConfirmStep(): void {
    this.popoverStep = 'confirm';
  }
  public backToSelectAreasStep(): void {
    this.popoverStep = 'select-areas';
  }

  public submitSetTriggerAreas(): void {
    const checkedAreas = this.areas.filter(
      (area) => this.selectedAreas[area.name],
    );
    const eventPlaceCodeIds = checkedAreas.map((area) => area.eventPlaceCodeId);

    this.analyticsService.logEvent(AnalyticsEvent.aboutTrigger, {
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0, // REFACTOR: this is outdated
      component: this.constructor.name,
    });

    const noNotifications = false;
    this.apiService
      .setTrigger(
        eventPlaceCodeIds,
        this.countryCodeISO3,
        this.disasterType,
        noNotifications,
      )
      .subscribe({
        next: () => {
          window.location.reload();
        },
        error: () =>
          this.actionResult(
            this.translateService.instant(
              `set-trigger-component.confirm.error`,
            ) as string,
          ),
      });
  }

  private async actionResult(resultMessage: string): Promise<void> {
    const popover = await this.popoverController.create({
      component: ActionResultPopoverComponent,
      animated: true,
      cssClass: 'ibf-popover ibf-popover-normal',
      translucent: true,
      showBackdrop: true,
      componentProps: {
        message: resultMessage,
      },
    });

    await popover.present();

    void popover.onDidDismiss().then(() => {
      window.location.reload();
    });
  }
}
