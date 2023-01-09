import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-action-result-popover',
  templateUrl: './action-result-popover.component.html',
  styleUrls: ['./action-result-popover.component.scss'],
})
export class ActionResultPopoverComponent implements OnInit {
  @Input()
  public message: string;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {
    setTimeout(async () => {
      const popover = await this.popoverController.getTop();
      if (popover) {
        this.closePopover();
      }
    }, 10000);
  }

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
