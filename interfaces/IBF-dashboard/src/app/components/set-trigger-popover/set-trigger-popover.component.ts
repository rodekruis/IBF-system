import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SetTriggerConfirmPopoverComponent } from 'src/app/components/set-trigger-confirm-popover/set-trigger-confirm-popover.component';
import { ForecastSource } from 'src/app/models/country.model';
import { AlertArea } from 'src/app/types/alert-area';

@Component({
  selector: 'app-set-trigger-popover',
  templateUrl: './set-trigger-popover.component.html',
  styleUrls: ['./set-trigger-popover.component.scss'],
  standalone: false,
})
export class SetTriggerPopoverComponent {
  @Input()
  public eventName: string;
  @Input()
  public forecastSource: ForecastSource;
  @Input()
  public adminAreaLabelPlural: string;
  @Input()
  public areas: AlertArea[];

  selectedAreas: Record<string, boolean> = {};

  constructor(private popoverController: PopoverController) {}

  public closePopover(): void {
    void this.popoverController.dismiss(null, 'cancel');
  }

  public confirm(): void {
    void this.popoverController.dismiss(null, 'confirm');
  }

  isSubmitDisabled(): boolean {
    return !Object.values(this.selectedAreas).some((value) => value);
  }

  public async openSetTriggerConfirmPopover(): Promise<void> {
    const checkedAreas = this.areas.filter(
      (area) => this.selectedAreas[area.name],
    );
    const popover = await this.popoverController.create({
      component: SetTriggerConfirmPopoverComponent,
      animated: true,
      cssClass: 'ibf-popover ibf-popover-normal',
      translucent: true,
      showBackdrop: true,
      componentProps: {
        checkedAreas,
        adminAreaLabelPlural: this.adminAreaLabelPlural,
      },
    });

    await popover.present();
  }
}
