import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ExportViewPopoverComponent } from 'src/app/components/export-view-popover/export-view-popover.component';

@Component({
  selector: 'app-export-view',
  templateUrl: './export-view.component.html',
  styleUrls: ['./export-view.component.scss'],
})
export class ExportViewComponent {
  constructor(private popoverController: PopoverController) {}

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: ExportViewPopoverComponent,
      animated: true,
      cssClass: 'ibf-export-view-popover',
      translucent: true,
      showBackdrop: true,
    });

    return await popover.present();
  }
}
