import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-toggle-trigger-popover',
  templateUrl: './toggle-trigger-popover.component.html',
  styleUrls: ['./toggle-trigger-popover.component.scss'],
})
export class ToggleTriggerPopoverComponent implements OnInit {
  @Input()
  public placeCodeName: string;

  @Input()
  public eapNode: string;

  @Input()
  public stopNode: string;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  public closePopover(): void {
    this.popoverController.dismiss(null, 'cancel');
  }

  public confirm(): void {
    this.popoverController.dismiss(null, 'confirm');
  }
}
