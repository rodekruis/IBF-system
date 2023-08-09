import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip-popover',
  templateUrl: './tooltip-popover.component.html',
  styleUrls: ['./tooltip-popover.component.scss'],
})
export class TooltipPopoverComponent {
  @Input()
  public value: string;

  constructor() {}
}
