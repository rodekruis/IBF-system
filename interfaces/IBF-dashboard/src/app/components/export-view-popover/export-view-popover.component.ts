import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-export-view-popover',
  templateUrl: './export-view-popover.component.html',
  styleUrls: ['./export-view-popover.component.scss'],
})
export class ExportViewPopoverComponent {
  constructor(private popoverController: PopoverController) {}

  public closePopover(): void {
    this.popoverController.dismiss();
  }

  public getOperatingSystem() {
    let operatingSystemName = 'Unknown';
    if (navigator.appVersion.includes('Win')) {
      operatingSystemName = 'Windows';
    }
    if (navigator.appVersion.includes('Mac')) {
      operatingSystemName = 'MacOS';
    }
    if (navigator.appVersion.includes('Linux')) {
      operatingSystemName = 'Linux';
    }
    return operatingSystemName;
  }
}
