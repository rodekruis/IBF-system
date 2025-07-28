import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TooltipPopoverComponent } from 'src/app/components/tooltip-popover/tooltip-popover.component';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  standalone: false,
})
export class TooltipComponent implements OnChanges {
  @Input()
  public value: string;

  @Input()
  public color: string;

  constructor(public popoverController: PopoverController) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input property changes for web component compatibility
    // No specific logic needed for tooltip component
  }

  async presentPopover(e: Event) {
    const popover = await this.popoverController.create({
      component: TooltipPopoverComponent,
      componentProps: { value: this.value },
      cssClass: 'tooltip--container leading-tight',
      event: e,
      showBackdrop: false,
    });

    await popover.present();
    await popover.onDidDismiss();
  }
}
