import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-stop-trigger-popover',
  templateUrl: './stop-trigger-popover.component.html',
  styleUrls: ['./stop-trigger-popover.component.scss'],
})
export class StopTriggerPopoverComponent implements OnInit {
  @Input()
  public disasterTypeName: string;

  @Input()
  public placeCodeName: string;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  public closePopover(): void {
    this.popoverController.dismiss(null, 'cancel');
  }

  public confirm(): void {
    this.popoverController.dismiss(null, 'confirm');
  }
}
