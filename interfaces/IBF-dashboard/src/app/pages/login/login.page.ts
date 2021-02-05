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
  public version: string = environment.ibf_system_version;

  constructor(private popoverController: PopoverController) {}

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: VideoPopoverComponent,
      componentProps: {
        videoURL: environment.ibf_video_guide_url,
      },
      animated: true,
      cssClass: 'ibf-video-guide-popover',
      translucent: true,
      showBackdrop: true,
    });

    return await popover.present();
  }
}
