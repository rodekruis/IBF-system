import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-tooltip-popover',
  templateUrl: './tooltip-popover.component.html',
  styleUrls: ['./tooltip-popover.component.scss'],
  standalone: false,
})
export class TooltipPopoverComponent {
  @Input()
  public value: string;

  constructor(private sanitizer: DomSanitizer) {}

  get safeValue(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.value || '');
  }
}
