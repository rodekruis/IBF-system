import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-screen-orientation-popover',
  templateUrl: './screen-orientation-popover.component.html',
  styleUrls: ['./screen-orientation-popover.component.scss'],
  standalone: false,
})
export class ScreenOrientationPopoverComponent {
  @Input()
  public device: string;

  constructor(private popoverController: PopoverController) {}

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
