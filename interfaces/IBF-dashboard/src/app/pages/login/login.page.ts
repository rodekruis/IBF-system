import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { VideoPopoverComponent } from 'src/app/components/video-popover/video-popover.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  public version: string = environment.ibfSystemVersion;

  constructor(private popoverController: PopoverController) {}

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: VideoPopoverComponent,
      componentProps: {
        videoUrl: environment.ibfVideoGuideUrl,
      },
      animated: true,
      cssClass: 'ibf-video-guide-popover',
      translucent: true,
      showBackdrop: true,
    });

    return await popover.present();
  }
}
