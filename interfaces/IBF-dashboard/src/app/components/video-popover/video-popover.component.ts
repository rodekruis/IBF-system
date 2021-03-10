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
  public videoUrl: string = environment.ibfVideoGuideUrl;

  constructor(
    private popoverController: PopoverController,
    private domSanitizer: DomSanitizer,
  ) {}

  public getVideoUrl(): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
  }

  public closePopover(): void {
    this.popoverController.dismiss();
  }
}
