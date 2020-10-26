import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-export-view-popover',
  templateUrl: './export-view-popover.component.html',
  styleUrls: ['./export-view-popover.component.scss'],
})
export class ExportViewPopoverComponent {
  constructor(private popoverController: PopoverController) {}

  public async closePopover() {
    await this.popoverController.dismiss();
  }

  public getOperatingSystem() {
    var operatingSystemName = 'Unknown';
    if (navigator.appVersion.indexOf('Win') != -1)
      operatingSystemName = 'Windows';
    if (navigator.appVersion.indexOf('Mac') != -1)
      operatingSystemName = 'MacOS';
    if (navigator.appVersion.indexOf('Linux') != -1)
      operatingSystemName = 'Linux';
    return operatingSystemName;
  }
}
