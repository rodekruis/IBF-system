import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PopoverController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'video-popover',
  templateUrl: './video-popover.component.html',
  styleUrls: ['./video-popover.component.scss'],
})
export class VideoPopoverComponent {
  constructor(
    private popoverController: PopoverController,
    private domSanitizer: DomSanitizer,
  ) {}

  public getVideoURL(): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(
      environment.ibf_video_url,
    );
  }

  public async closePopover(): Promise<void> {
    await this.popoverController.dismiss();
  }
}
