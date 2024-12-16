import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TooltipPopoverComponent } from 'src/app/components/tooltip-popover/tooltip-popover.component';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent {
  @Input()
  public value: string;

  @Input()
  public color: string;

  constructor(public popoverController: PopoverController) {}

  async presentPopover(e: Event) {
    const popover = await this.popoverController.create({
      component: TooltipPopoverComponent,
      componentProps: { value: this.value },
      cssClass: 'tooltip--container',
      event: e,
      showBackdrop: false,
    });
    await popover.present();

    await popover.onDidDismiss();
  }
}
