import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { VideoPopoverComponent } from '../video-popover/video-popover.component';

@Component({
  selector: 'video-guide-button',
  templateUrl: './video-guide-button.component.html',
  styleUrls: ['./video-guide-button.component.scss'],
})
export class VideoGuideButtonComponent {
  @Input()
  public color: string = 'ibf-royal-blue';

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
