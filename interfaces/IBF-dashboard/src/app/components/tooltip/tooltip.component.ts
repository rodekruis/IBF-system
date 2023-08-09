import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TooltipPopoverComponent } from '../tooltip-popover/tooltip-popover.component';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent {
  @Input()
  public value: string;

  constructor(public popoverController: PopoverController) {}

  async presentPopover(e: Event) {
    const popover = await this.popoverController.create({
      component: TooltipPopoverComponent,
      componentProps: { value: this.value },
      cssClass: 'my-custom-class',
      event: e,
      showBackdrop: false,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
}
