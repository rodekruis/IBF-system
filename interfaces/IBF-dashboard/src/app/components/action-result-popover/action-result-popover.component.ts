import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-action-result-popover',
  templateUrl: './action-result-popover.component.html',
  styleUrls: ['./action-result-popover.component.scss'],
  standalone: false,
})
export class ActionResultPopoverComponent implements OnInit, OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input property changes for web component compatibility
    // No specific logic needed for action result popover
  }

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
