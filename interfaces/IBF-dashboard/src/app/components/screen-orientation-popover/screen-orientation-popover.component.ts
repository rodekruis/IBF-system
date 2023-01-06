import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-screen-orientation-popover',
  templateUrl: './screen-orientation-popover.component.html',
  styleUrls: ['./screen-orientation-popover.component.scss'],
})
export class ScreenOrientationPopoverComponent implements OnInit {
  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
